import subprocess
import sys

def ejecutar_comando(comando):
    """Ejecuta un comando en la terminal y maneja errores."""
    resultado = subprocess.run(comando, shell=True, text=True, capture_output=True)
    if resultado.returncode != 0:
        print(f"❌ Error en: {comando}")
        print(f"Detalle: {resultado.stderr.strip()}")
        return False
    print(resultado.stdout.strip())
    return True

def actualizar_repositorio():
    print("=" * 60)
    print("👑 AUTOMATIZADOR DE COMMITS - MAXIQUEEN OS 👑")
    print("=" * 60)

    # 1. Solicitar el mensaje del commit
    mensaje = input("\n📝 Introduce el mensaje para el commit (o presiona Enter para usar por defecto): ")
    if not mensaje.strip():
        mensaje = "Actualización automática del ecosistema MaxiQueen OS"

    print("\n🚀 Iniciando sincronización con GitHub...")

    # 2. Agregar todos los archivos nuevos o modificados (incluyendo el panel de control)
    print("\n[1/3] Indexando cambios (git add .)...")
    if not ejecutar_comando("git add ."):
        sys.exit(1)

    # 3. Crear el commit localmente
    print(f"\n[2/3] Creando commit: '{mensaje}'...")
    # Evita que falle si no hay cambios reales que subir
    resultado_commit = subprocess.run(f'git commit -m "{mensaje}"', shell=True, text=True, capture_output=True)
    if "nothing to commit" in resultado_commit.stdout or "nada para hacer commit" in resultado_commit.stdout:
        print("💡 No se detectaron cambios nuevos para confirmar.")
    else:
        print(resultado_commit.stdout.strip())

    # 4. Subir a la rama principal (main)
    print("\n[3/3] Subiendo cambios a GitHub (git push origin main)...")
    if ejecutar_comando("git push origin main"):
        print("\n✨ ¡Éxito total! Todo tu equipo y el panel están sincronizados en GitHub.")
    else:
        print("\n⚠️ El push falló. Verifica tu conexión o los permisos del repositorio.")

if __name__ == "__main__":
    actualizar_repositorio()