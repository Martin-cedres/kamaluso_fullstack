---
description: Especialista en migración, transformación y backup de datos MongoDB
---

# Skill: Data Migration Expert

## Propósito
Esta habilidad guía al agente en la creación, ejecución y validación de scripts de migración de datos, backups y transformaciones de schema en MongoDB para el proyecto Kamaluso.

## Contexto del Proyecto

**Base de Datos**: MongoDB (v6.18.0)
**ORM**: Mongoose (v8.18.1)
**Conexión**: `lib/mongoose.ts` → función `connectDB()`

## Tipos de Operaciones

### 1. Migraciones de Schema

#### Escenario A: Agregar Campo Nuevo
**Ejemplo**: Agregar `proposedContent` a Posts para el sistema de Topic Clusters

```typescript
// scripts/add-proposed-content-field.ts
import mongoose from 'mongoose';
import Post from '../models/Post';

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const result = await Post.updateMany(
    { proposedContent: { $exists: false } },
    { 
      $set: { 
        proposedContent: null,
        contentStatus: 'published'
      } 
    }
  );
  
  console.log(`✅ Actualizados ${result.modifiedCount} posts`);
  await mongoose.disconnect();
}

migrate().catch(console.error);
```

**Ejecutar**:
```bash
npx ts-node scripts/add-proposed-content-field.ts
```

#### Escenario B: Renombrar Campo
```typescript
await Product.updateMany(
  {},
  { $rename: { 'oldFieldName': 'newFieldName' } }
);
```

#### Escenario C: Cambiar Tipo de Dato
**Ejemplo**: Convertir `category` de string a ObjectId

```typescript
import Category from '../models/Category';

const products = await Product.find({ category: { $type: 'string' } });

for (const product of products) {
  const categorySlug = product.category;
  const categoryDoc = await Category.findOne({ slug: categorySlug });
  
  if (categoryDoc) {
    product.category = categoryDoc._id;
    await product.save();
  } else {
    console.warn(`⚠️ Categoría no encontrada: ${categorySlug}`);
  }
}
```

### 2. Limpieza de Datos

#### Eliminar Campos Obsoletos
```typescript
await Product.updateMany(
  {},
  { $unset: { deprecatedField1: "", deprecatedField2: "" } }
);
```

#### Corregir Valores Inválidos
**Ejemplo**: Normalizar arrays vacíos
```typescript
await Product.updateMany(
  { keywords: { $in: [null, []] } },
  { $set: { keywords: [] } }
);
```

### 3. Backups

#### Script de Backup Completo
**Ubicación**: `scripts/backup-db.js`

```javascript
const { exec } = require('child_process');
const path = require('path');

const timestamp = new Date().toISOString().replace(/:/g, '-');
const backupDir = path.join(__dirname, '../backups');
const backupFile = `kamaluso-backup-${timestamp}`;

const command = `mongodump --uri="${process.env.MONGODB_URI}" --out="${backupDir}/${backupFile}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error en backup:', error);
    return;
  }
  console.log(`✅ Backup guardado en: ${backupDir}/${backupFile}`);
});
```

#### Backup de Modelo Específico
```bash
mongoexport --uri="$MONGODB_URI" --collection=products --out=backup_products.json
```

#### Restaurar Backup
```bash
mongoimport --uri="$MONGODB_URI" --collection=products --file=backup_products.json
```

### 4. Sincronización de Datos

#### Sincronizar Slugs Duplicados
**Problema**: Dos productos con el mismo slug causan errores 404

```typescript
// scripts/fix-duplicate-slugs.ts
const products = await Product.find({});
const slugCounts = {};

for (const product of products) {
  slugCounts[product.slug] = (slugCounts[product.slug] || 0) + 1;
}

for (const [slug, count] of Object.entries(slugCounts)) {
  if (count > 1) {
    console.log(`⚠️ Slug duplicado: ${slug}`);
    const duplicates = await Product.find({ slug }).sort({ createdAt: 1 });
    
    // Mantener el primero, renombrar los demás
    for (let i = 1; i < duplicates.length; i++) {
      duplicates[i].slug = `${slug}-${i}`;
      await duplicates[i].save();
      console.log(`✅ Renombrado a: ${duplicates[i].slug}`);
    }
  }
}
```

#### Propagar Cambios en Relaciones
**Ejemplo**: Actualizar referencias cuando cambias un slug

```typescript
// Si cambias el slug de un Post, actualizar PillarPages que lo referencian
const oldSlug = 'regalos-empresariales';
const newSlug = 'regalos-corporativos-uruguay';

await PillarPage.updateMany(
  { 'clusterPosts.slug': oldSlug },
  { $set: { 'clusterPosts.$.slug': newSlug } }
);

// Agregar redirección
await Redirect.create({
  from: `/blog/${oldSlug}`,
  to: `/blog/${newSlug}`,
  permanent: true
});
```

## Mejores Prácticas

### 1. Siempre Hacer Backup Antes
```bash
# Antes de CUALQUIER migración
node scripts/backup-db.js
```

### 2. Dry-Run Mode
```typescript
const DRY_RUN = true; // Cambiar a false para ejecutar de verdad

if (DRY_RUN) {
  console.log('🔍 DRY RUN - No se realizarán cambios');
  const count = await Product.countDocuments(query);
  console.log(`Se afectarían ${count} documentos`);
} else {
  const result = await Product.updateMany(query, update);
  console.log(`✅ Actualizados ${result.modifiedCount} documentos`);
}
```

### 3. Logging Completo
```typescript
const migrationLog = {
  timestamp: new Date(),
  script: 'add-seo-fields',
  documentsAffected: 0,
  errors: []
};

try {
  // Migración...
  migrationLog.documentsAffected = result.modifiedCount;
} catch (error) {
  migrationLog.errors.push(error.message);
} finally {
  console.log(JSON.stringify(migrationLog, null, 2));
  // Opcional: Guardar log en BD
  await MigrationLog.create(migrationLog);
}
```

### 4. Transacciones para Operaciones Críticas
```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Product.updateMany({ status: 'draft' }, { status: 'pending' }, { session });
  await Category.updateOne({ slug }, { productCount: newCount }, { session });
  
  await session.commitTransaction();
  console.log('✅ Migración completada con éxito');
} catch (error) {
  await session.abortTransaction();
  console.error('❌ Error, se revirtieron cambios:', error);
} finally {
  session.endSession();
}
```

### 5. Validación Post-Migración
```typescript
async function validate() {
  // Ejemplo: Verificar que todos los productos tienen categoría válida
  const orphans = await Product.find({ category: null });
  
  if (orphans.length > 0) {
    console.error(`❌ ${orphans.length} productos sin categoría`);
    return false;
  }
  
  console.log('✅ Validación exitosa');
  return true;
}

await migrate();
const isValid = await validate();

if (!isValid) {
  console.error('⚠️ La validación falló, revisar datos');
}
```

## Scripts Existentes en el Proyecto

El proyecto ya tiene varios scripts útiles en `/scripts`:

### Scripts de Migración:
- `migrar-categorias.js`: Migración de estructura de categorías
- `migrar-estructura-categorias.js`: Reestructuración completa
- `corregir-campos-array.js`: Normalización de arrays
- `inicializar-campos.ts`: Inicialización de nuevos campos

### Scripts de Corrección:
- `fix-broken-links.ts`: Reparar enlaces rotos
- `fix-image-urls.js`: Corregir URLs de imágenes
- `fix-product-categories.js`: Corregir relaciones producto-categoría

### Scripts de Diagnóstico:
- `diagnosticar-datos.ts`: Análisis general de salud de datos
- `check-slugs.js`: Verificar slugs únicos
- `check-product-categories.js`: Validar categorías

### Scripts de Backup:
- `backup-db.js`: Backup completo de MongoDB

## Patrón para Crear Nueva Migración

1. **Crear archivo**: `scripts/migracion-[descripcion].ts`
2. **Template**:
```typescript
import mongoose from 'mongoose';
import Model from '../models/Model';

const DRY_RUN = true; // Cambiar a false para ejecutar

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('🔗 Conectado a MongoDB');
    
    if (DRY_RUN) {
      const count = await Model.countDocuments(query);
      console.log(`🔍 DRY RUN: Se afectarían ${count} documentos`);
      return;
    }
    
    // HACER BACKUP
    console.log('💾 Recomendación: Hacer backup antes de continuar');
    
    const result = await Model.updateMany(query, update);
    console.log(`✅ Migración exitosa: ${result.modifiedCount} documentos actualizados`);
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
```

3. **Ejecutar**:
```bash
# DRY RUN primero
npx ts-node scripts/migracion-[descripcion].ts

# Si todo OK, cambiar DRY_RUN = false y ejecutar
npx ts-node scripts/migracion-[descripcion].ts
```

## Debugging de Problemas Comunes

### Problema: "Document failed validation"
**Causa**: El nuevo schema de Mongoose tiene campos required que los docs viejos no tienen

**Solución**:
```typescript
// Opción 1: Hacer campos opcionales temporalmente
const schema = new Schema({
  newField: { type: String, required: false } // Cambiar a true después de migración
});

// Opción 2: Usar updateMany con validación deshabilitada
await Model.updateMany(
  query,
  update,
  { runValidators: false }
);
```

### Problema: Migración muy lenta
**Causa**: Actualizar muchos documentos de uno en uno

**Solución**:
```typescript
// ❌ LENTO (loop)
for (const doc of docs) {
  await doc.save();
}

// ✅ RÁPIDO (bulk operation)
await Model.bulkWrite(
  docs.map(doc => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { field: value } }
    }
  }))
);
```

## Recursos Relacionados
- [Database Guard Skill](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/database-guard/SKILL.md)
- [Mongoose Connection](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/lib/mongoose.ts)
- [Scripts Directory](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/scripts/)

## Checklist para Nueva Migración

- [ ] Backup realizado
- [ ] Script probado en DRY RUN mode
- [ ] Logging implementado
- [ ] Validación post-migración creada
- [ ] Documentado en CHANGELOG.md
- [ ] Reversión planificada (si es posible)
- [ ] Probado en entorno de desarrollo
- [ ] Variables de entorno verificadas
