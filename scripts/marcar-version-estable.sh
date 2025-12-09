#!/bin/bash

# =============================================================================
# Script para marcar versiones estables en Git
# Uso: ./scripts/marcar-version-estable.sh v1.1.0 "Descripción de los cambios"
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Verificar argumentos
if [ -z "$1" ]; then
    echo -e "${RED}Error: Debes proporcionar un número de versión${NC}"
    echo ""
    echo "Uso: $0 <version> [descripción]"
    echo "Ejemplo: $0 v1.1.0 \"Corrección de bugs en el login\""
    echo ""
    echo -e "${YELLOW}Versiones estables actuales:${NC}"
    git tag -l "*-estable" | sort -V
    exit 1
fi

VERSION="$1-estable"
DESCRIPCION="${2:-Versión estable marcada el $(date '+%Y-%m-%d %H:%M')}"

# Verificar que estamos en la rama Mi-cerebro
RAMA_ACTUAL=$(git branch --show-current)
if [ "$RAMA_ACTUAL" != "Mi-cerebro" ]; then
    echo -e "${YELLOW}Advertencia: No estás en la rama Mi-cerebro (estás en: $RAMA_ACTUAL)${NC}"
    read -p "¿Deseas continuar de todos modos? (s/n): " CONTINUAR
    if [ "$CONTINUAR" != "s" ]; then
        echo "Operación cancelada."
        exit 1
    fi
fi

# Verificar si hay cambios sin commitear
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Tienes cambios sin commitear. ¿Deseas hacer commit primero?${NC}"
    read -p "(s/n): " HACER_COMMIT
    if [ "$HACER_COMMIT" = "s" ]; then
        git add .
        git commit -m "Cambios antes de marcar $VERSION"
    fi
fi

# Verificar si el tag ya existe
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}Error: El tag $VERSION ya existe${NC}"
    echo "Tags existentes:"
    git tag -l "*-estable" | sort -V
    exit 1
fi

echo -e "${BLUE}Creando tag: $VERSION${NC}"
echo -e "${BLUE}Descripción: $DESCRIPCION${NC}"
echo ""

# Crear el tag
git tag -a "$VERSION" -m "$DESCRIPCION"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al crear el tag${NC}"
    exit 1
fi

# Subir el tag al repositorio remoto
echo -e "${BLUE}Subiendo tag al repositorio...${NC}"
git push canvasmind "$VERSION"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al subir el tag${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Versión $VERSION marcada exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Para regresar a esta versión si hay problemas:${NC}"
echo "  ./scripts/rollback-version.sh $VERSION"
echo ""
echo -e "${YELLOW}Todas las versiones estables:${NC}"
git tag -l "*-estable" | sort -V
