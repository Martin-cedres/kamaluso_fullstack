# Admin Feature Generator Skill

Esta habilidad permite al asistente generar componentes, páginas y endpoints para el panel de administración de Kamaluso (`/admin`), asegurando que las nuevas funciones sean consistentes con el diseño y la lógica actual.

## Propósito
- Crear nuevas páginas de administración (`pages/admin/*.tsx`).
- Desarrollar widgets y estadísticas para el Command Center (`pages/admin/index.tsx`).
- Implementar formularios de gestión de datos con validación y notificaciones (toasts).
- Generar endpoints de API administrativos (`pages/api/admin/*.ts`).

## Arquitectura de Referencia
- **Framework**: Next.js (Pages Router).
- **Estilos**: Tailwind CSS.
- **Iconos**: `@heroicons/react/24/outline`.
- **Layout**: Siempre envolver las páginas en `AdminLayout` de `../../components/AdminLayout`.
- **Autenticación**: Uso de `useSession` y protección de rutas mediante el rol `admin`.
- **Notificaciones**: `react-hot-toast`.

## Estándares de Código
1. **Páginas**:
   - Deben ser `default exports`.
   - Deben usar `AdminLayout`.
   - Títulos con `h1 className="text-3xl font-bold text-gray-900"`.
   - Secciones agrupadas en `bg-white rounded-xl shadow-sm border border-gray-100 p-6`.

2. **APIs**:
   - Manejar métodos (GET, POST, etc.) explícitamente.
   - Usar `connectDB` de `../../lib/mongoose`.
   - Verificar la sesión de `admin` antes de procesar cualquier lógica sensible.

3. **UI/UX**:
   - Usar gradientes para acciones principales (`bg-gradient-to-br from-purple-600 to-pink-600`).
   - Estados de carga consistentes (spinners o esqueletos).
   - Confirmación de acciones destructivas (modales de advertencia).

## Instrucciones de Uso
Cuando el usuario pida una nueva función de admin, seguí estos pasos:
1. Analizá el modelo de datos (`models/`).
2. Diseñá el endpoint de API necesario en `pages/api/admin/`.
3. Creá la interfaz de usuario en `pages/admin/` siguiendo el patrón estético del Command Center.
4. Actualizá la navegación en `components/AdminLayout.tsx` si es una nueva sección principal.
