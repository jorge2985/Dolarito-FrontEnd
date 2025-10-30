#!/bin/bash

# Dolarito Frontend AWS Deployment Script
# This script automates the deployment of the Vue.js frontend to AWS

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="dolarito-frontend"
ECS_CLUSTER="production-dolarito-cluster"
ECS_SERVICE="production-dolarito-service"
ECS_TASK_DEFINITION="production-dolarito-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    log_success "AWS CLI is installed"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    log_success "Docker is installed"
}

# Login to ECR
login_ecr() {
    log_info "Logging into ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
    log_success "Successfully logged into ECR"
}

# Build and push Docker image
build_and_push() {
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local ecr_uri="$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"
    
    log_info "Building Docker image..."
    docker build -t $ECR_REPOSITORY .
    
    log_info "Tagging image for ECR..."
    docker tag $ECR_REPOSITORY:latest $ecr_uri:latest
    
    log_info "Pushing image to ECR..."
    docker push $ecr_uri:latest
    
    log_success "Image pushed successfully to ECR"
}

# Update ECS service
update_ecs_service() {
    log_info "Updating ECS service..."
    
    # Get the current task definition
    local current_task_def=$(aws ecs describe-services \
        --cluster $ECS_CLUSTER \
        --services $ECS_SERVICE \
        --region $AWS_REGION \
        --query 'services[0].taskDefinition' \
        --output text)
    
    # Create new task definition revision
    local new_task_def=$(aws ecs describe-task-definition \
        --task-definition $current_task_def \
        --region $AWS_REGION \
        --query 'taskDefinition' \
        --output json)
    
    # Remove fields that can't be included in new task definition
    local cleaned_task_def=$(echo $new_task_def | jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')
    
    # Register new task definition
    local new_task_def_arn=$(echo $cleaned_task_def | aws ecs register-task-definition \
        --region $AWS_REGION \
        --cli-input-json file:///dev/stdin \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text)
    
    # Update service with new task definition
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $ECS_SERVICE \
        --task-definition $new_task_def_arn \
        --region $AWS_REGION \
        --output table
    
    log_success "ECS service updated successfully"
}

# Wait for deployment to complete
wait_for_deployment() {
    log_info "Waiting for deployment to complete..."
    
    aws ecs wait services-stable \
        --cluster $ECS_CLUSTER \
        --services $ECS_SERVICE \
        --region $AWS_REGION
    
    log_success "Deployment completed successfully!"
}

# Main deployment function
deploy() {
    log_info "Starting deployment process..."
    
    check_aws_cli
    check_docker
    login_ecr
    build_and_push
    update_ecs_service
    wait_for_deployment
    
    log_success "Deployment completed successfully!"
    log_info "You can view your application at the ALB DNS name in the CloudFormation outputs"
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Get the current task definition
    local current_task_def=$(aws ecs describe-services \
        --cluster $ECS_CLUSTER \
        --services $ECS_SERVICE \
        --region $AWS_REGION \
        --query 'services[0].taskDefinition' \
        --output text)
    
    # Get the previous task definition
    local task_def_family=$(echo $current_task_def | cut -d: -f1-2)
    local current_revision=$(echo $current_task_def | cut -d: -f3)
    local previous_revision=$((current_revision - 1))
    local previous_task_def="$task_def_family:$previous_revision"
    
    if [ $previous_revision -lt 1 ]; then
        log_error "No previous version to rollback to"
        exit 1
    fi
    
    # Update service to previous task definition
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $ECS_SERVICE \
        --task-definition $previous_task_def \
        --region $AWS_REGION
    
    wait_for_deployment
    log_success "Rollback completed successfully!"
}

# Show usage
usage() {
    echo "Usage: $0 [deploy|rollback|status]"
    echo ""
    echo "Commands:"
    echo "  deploy   - Deploy the application to AWS"
    echo "  rollback - Rollback to the previous version"
    echo "  status   - Show deployment status"
    echo ""
    echo "Environment variables:"
    echo "  AWS_REGION           - AWS region (default: us-east-1)"
    echo "  ECR_REPOSITORY       - ECR repository name (default: dolarito-frontend)"
    echo "  ECS_CLUSTER          - ECS cluster name (default: production-dolarito-cluster)"
    echo "  ECS_SERVICE          - ECS service name (default: production-dolarito-service)"
}

# Show status
show_status() {
    log_info "Checking deployment status..."
    
    aws ecs describe-services \
        --cluster $ECS_CLUSTER \
        --services $ECS_SERVICE \
        --region $AWS_REGION \
        --query 'services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount,TaskDefinition:taskDefinition}' \
        --output table
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    status)
        show_status
        ;;
    *)
        usage
        exit 1
        ;;
esac
