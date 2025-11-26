@echo off
echo ================================================
echo 🚀 Desplegando Función Lambda de Procesamiento
echo ================================================
echo.

cd lambda-package

echo 📦 Instalando dependencias...
call npm install
echo Instalando sharp para Linux x64 (AWS Lambda)...
call npm install --platform=linux --arch=x64 sharp
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo 📁 Creando archivo ZIP para despliegue...
if exist ..\lambda-deployment.zip del ..\lambda-deployment.zip

powershell -Command "Compress-Archive -Path index.mjs,node_modules,package.json -DestinationPath ..\lambda-deployment.zip -Force"

if %errorlevel% neq 0 (
    echo ❌ Error creando archivo ZIP
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Archivo lambda-deployment.zip creado exitosamente
echo.
echo ================================================
echo 📤 PRÓXIMOS PASOS MANUALES:
echo ================================================
echo 1. Ir a AWS Console → Lambda
echo 2. Seleccionar tu función Lambda
echo 3. Click en "Upload from" → ".zip file"
echo 4. Subir: lambda-deployment.zip
echo 5. Click en "Save"
echo 6. Verificar logs en CloudWatch después de subir una imagen
echo ================================================
echo.

pause
