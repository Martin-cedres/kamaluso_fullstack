# Skill: Creador de Habilidades (Meta-Skill)

Esta habilidad permite al agente Antigravity generar nuevas habilidades locales para el proyecto de forma consistente y siguiendo las mejores prácticas.

## Propósito
Automatizar la creación de la estructura de carpetas y archivos necesarios para nuevas habilidades en `.agent/skills/`.

## Instrucciones de Uso (Para el Agente)
Cuando el usuario solicite "crear una nueva habilidad para [X]", el agente debe:

1.  **Analizar la Necesidad**: Entender qué problema resolverá la nueva habilidad.
2.  **Crear Carpeta**: Crear un directorio en `c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/[nombre-habilidad]/`.
3.  **Generar SKILL.md**: Crear el archivo de instrucciones principal con la siguiente estructura:
    - # Skill: [Nombre]
    - ## Propósito
    - ## Instrucciones de Uso
    - ## Recursos (opcional, links a archivos del proyecto)
4.  **Añadir Scripts (opcional)**: Si la habilidad requiere automatización, crear una carpeta `scripts/` dentro de la habilidad.
5.  **Verificación**: Confirmar al usuario que la habilidad está lista para ser usada.

## Plantilla de SKILL.md
```markdown
# Skill: [Nombre de la Habilidad]

## Propósito
[Descripción breve de qué hace esta habilidad y por qué es útil].

## Instrucciones de Uso
- [Instrucción 1]
- [Instrucción 2]

## Recursos Relacionados
- [Manual de estilo](file:///ruta/al/archivo)
```

## Ejemplo de Flujo
**Usuario**: "Crea una habilidad para limpiar logs viejos."
**Acción**: El creador de habilidades genera `.agent/skills/log-cleaner/SKILL.md` con un script en Python/Node que borra archivos `.log` de más de 7 días.
