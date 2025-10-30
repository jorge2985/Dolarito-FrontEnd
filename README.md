# Dolarito Frontend

Una aplicación de billetera virtual moderna construida con Vue.js 3, TypeScript y Tailwind CSS. Esta aplicación permite a los usuarios gestionar sus fondos en pesos argentinos y dólares estadounidenses de forma segura y eficiente.

## 🚀 Características

- **Billetera Virtual**: Gestiona saldos en ARS y USD
- **Transacciones**: Realiza depósitos, retiros, transferencias y cambios de moneda
- **Interfaz Responsive**: Diseño adaptativo para dispositivos móviles y desktop
- **Autenticación JWT**: Sistema de autenticación seguro
- **Tiempo Real**: Actualizaciones en tiempo real de balances y transacciones
- **Docker Ready**: Configuración completa para contenedores
- **AWS Deployable**: Scripts y configuraciones para deployment en AWS

## 🛠️ Tecnologías

- **Frontend**: Vue.js 3, TypeScript, Composition API
- **Styling**: Tailwind CSS, Heroicons
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Notifications**: Vue Toastification
- **Build Tool**: Vite
- **Containerization**: Docker, Docker Compose
- **Cloud**: AWS ECS, ECR, CloudFormation

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Docker (opcional)
- AWS CLI (para deployment)

## 🚀 Instalación y Desarrollo

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd DolaritoFE
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp env.example .env.local
```

Edita `.env.local` con tus configuraciones:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENVIRONMENT=development
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🐳 Docker

### Desarrollo con Docker

```bash
# Usar Docker Compose para desarrollo
docker-compose -f docker-compose.dev.yml up --build

# O construir manualmente
docker build -f Dockerfile.dev -t dolarito-frontend:dev .
docker run -p 3000:3000 dolarito-frontend:dev
```

### Producción con Docker

```bash
# Construir imagen de producción
docker build -t dolarito-frontend:latest .

# Ejecutar contenedor
docker run -p 80:80 dolarito-frontend:latest
```

### Docker Compose Completo

```bash
# Levantar toda la stack (frontend + backend + database)
docker-compose up --build
```

## 🏗️ Build para Producción

```bash
# Build estático
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Tests
npm run test:unit
```

## ☁️ Deployment en AWS

### Prerrequisitos

1. AWS CLI configurado
2. ECR repository creado
3. ECS cluster configurado
4. CloudFormation stack desplegado

### 1. Configurar ECR Repository

```bash
aws ecr create-repository --repository-name dolarito-frontend --region us-east-1
```

### 2. Desplegar con CloudFormation

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation.yml \
  --stack-name dolarito-frontend \
  --parameter-overrides Environment=production DomainName=dolarito.com \
  --capabilities CAPABILITY_IAM
```

### 3. Deploy automático

```bash
# Deploy completo
./aws/deploy.sh deploy

# Verificar status
./aws/deploy.sh status

# Rollback si es necesario
./aws/deploy.sh rollback
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   ├── WalletCard.vue
│   ├── DepositModal.vue
│   └── WithdrawModal.vue
├── views/              # Vistas/páginas
│   ├── DashboardView.vue
│   ├── LoginView.vue
│   ├── WalletView.vue
│   ├── TransactionsView.vue
│   ├── SendMoneyView.vue
│   ├── ExchangeView.vue
│   └── ProfileView.vue
├── stores/             # Pinia stores
│   ├── auth.ts
│   └── transactions.ts
├── services/           # Servicios API
│   └── api.ts
├── types/              # Definiciones TypeScript
│   └── index.ts
├── router/             # Configuración de rutas
│   └── index.ts
├── assets/             # Assets estáticos
└── main.ts            # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL del backend API | `http://localhost:5000/api` |
| `VITE_ENVIRONMENT` | Entorno de ejecución | `development` |
| `VITE_ENABLE_DEBUG` | Habilitar logs de debug | `true` |
| `VITE_ENABLE_ANALYTICS` | Habilitar analytics | `false` |

### API Endpoints

La aplicación se conecta con el backend .NET Core a través de estos endpoints:

- `POST /api/Autenticacion/Autenticar` - Login
- `GET /api/Usuario/Lista` - Listar usuarios
- `POST /api/Transacciones` - Crear transacción
- `GET /api/Transacciones/usuario/{userId}` - Obtener transacciones

## 🎨 Diseño y UX

### Características de Diseño

- **Responsive Design**: Adaptable a todos los dispositivos
- **Dark/Light Mode**: Soporte para temas (próximamente)
- **Accesibilidad**: Cumple estándares WCAG 2.1
- **Animaciones**: Transiciones suaves y feedback visual
- **Iconografía**: Heroicons para consistencia visual

### Paleta de Colores

- **Primary**: Blue (#3b82f6)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)

## 🧪 Testing

```bash
# Tests unitarios
npm run test:unit

# Tests con coverage
npm run test:unit -- --coverage

# Tests e2e (próximamente)
npm run test:e2e
```

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA con:

- Service Worker para cache offline
- Manifest para instalación en dispositivos
- Notificaciones push (próximamente)

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- HTTPS obligatorio en producción
- Headers de seguridad configurados
- Validación de entrada en formularios
- Sanitización de datos

## 📊 Monitoreo y Analytics

- CloudWatch logs para monitoreo
- Sentry para error tracking (opcional)
- Google Analytics (opcional)
- Health checks configurados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas:

- Email: soporte@dolarito.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Documentación: [Wiki](https://github.com/your-repo/wiki)

## 🗺️ Roadmap

### Próximas Características

- [ ] Modo oscuro
- [ ] Notificaciones push
- [ ] Biometría para autenticación
- [ ] Soporte para más monedas
- [ ] Integración con bancos
- [ ] API pública para desarrolladores
- [ ] App móvil nativa

---

**Dolarito** - Tu billetera virtual del futuro 🚀
