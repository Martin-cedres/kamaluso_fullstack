# Leer prompt base desde kamaluso_prompt.txt
$prompt = Get-Content -Raw ".\kamaluso_prompt.txt"

# Pedir la consulta al usuario
$pregunta = Read-Host "Escribe tu consulta para Kamaluso"

# Combinar prompt base + pregunta
$fullPrompt = "$prompt`n$pregunta"

# Ejecutar el modelo LLaMA 2 7B con el prompt completo
ollama run llama2:7b --prompt "$fullPrompt"
