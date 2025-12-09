#!/bin/bash

# =============================================================================
# Script para regresar a una versión estable anterior
# Uso: ./scripts/rollback-version.sh v1.0.0-estable
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   Rollback a Versión Estable${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Mostrar versiones disponibles
echo -e "${YELLOW}Versiones estables disponibles:${NC}"
echo ""
git tag -l "*-estable" --sort=-version:refname | while read tag; do
    FECHA=$(git log -1 --format=%ai "$tag" 2>/dev/null | cut -d' ' -f1)
    MENSAJE=$(git tag -l -n1 "$tag" | sed "s/$tag//")
    echo -e "  ${GREEN}$tag${NC} ($FECHA) -$MENSAJE"
done
echo ""

# Si no se proporciona versión, solo mostrar lista
if [ -z "$1" ]; then
    echo -e "${YELLOW}Uso: $0 <version-estable>${NC}"
    echo "Ejemplo: $0 v1.0.0-estable"
    echo ""
    echo -e "${BLUE}Versión actual:${NC}"
    git log -1 --oneline
    exit 0
fi

VERSION="$1"

# Verificar que el tag existe
if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}Error: La versión $VERSION no existe${NC}"
    echo ""
    echo "Versiones disponibles:"
    git tag -l "*-estable" | sort -V
    exit 1
fi

# Mostrar información del tag
echo -e "${BLUE}Información de $VERSION:${NC}"
git show "$VERSION" --quiet
echo ""

# Advertencia
echo -e "${RED}========================================${NC}"
echo -e "${RED}   ¡ADVERTENCIA!${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo "Esta operación:"
echo "  1. Guardará tus cambios actuales en una rama de respaldo"
echo "  2. Restaurará el código a la versión $VERSION"
echo "  3. Subirá los cambios al repositorio remoto"
echo ""
echo -e "${YELLOW}Se perderán los cambios no guardados.${NC}"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " CONFIRMACION

if [ "$CONFIRMACION" != "SI" ]; then
    echo "Operación cancelada."
    exit 1
fi

# Crear rama de respaldo con los cambios actuales
FECHA_RESPALDO=$(date '+%Y%m%d_%H%M%S')
RAMA_RESPALDO="respaldo-antes-rollback-$FECHA_RESPALDO"

echo ""
echo -e "${BLUE}Creando respaldo en rama: $RAMA_RESPALDO${NC}"

# Guardar cambios actuales si hay
git stash push -m "Cambios antes de rollback a $VERSION" 2>/dev/null

# Crear rama de respaldo
git branch "$RAMA_RESPALDO"

echo -e "${GREEN}✓ Respaldo creado en: $RAMA_RESPALDO${NC}"
echo ""

# Hacer el rollback
echo -e "${BLUE}Restaurando a $VERSION...${NC}"

# Reset al tag
git reset --hard "$VERSION"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error durante el rollback${NC}"
    exit 1
fi

# Subir los cambios
echo -e "${BLUE}Subiendo cambios al repositorio...${NC}"
git push canvasmind Mi-cerebro --force

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al subir los cambios${NC}"
    echo "Puedes intentar manualmente: git push canvasmind Mi-cerebro --force"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Rollback completado${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Ahora estás en: ${CYAN}$VERSION${NC}"
echo ""
echo -e "${YELLOW}Si necesitas recuperar los cambios anteriores:${NC}"
echo "  git checkout $RAMA_RESPALDO"
echo ""
echo -e "${YELLOW}Para volver a Mi-cerebro después:${NC}"
echo "  git checkout Mi-cerebro"
