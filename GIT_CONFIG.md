# Configuración Git - Canvas Mind

## Repositorio Oficial

```
https://github.com/mpiafinlay-art/canvas-mind
```

## Rama de Trabajo: Mi-cerebro

**Clonar el proyecto:**
```bash
git clone -b Mi-cerebro https://github.com/mpiafinlay-art/canvas-mind.git
```

**URL directa de la rama:**
```
https://github.com/mpiafinlay-art/canvas-mind/tree/Mi-cerebro
```

## Comandos Útiles

### Marcar versión estable
```bash
./scripts/marcar-version-estable.sh v1.1.0 "Descripción"
```

### Regresar a versión anterior
```bash
./scripts/rollback-version.sh v1.0.0-estable
```

### Ver versiones estables
```bash
git tag -l "*-estable"
```

### Subir cambios
```bash
git add .
git commit -m "Descripción del cambio"
git push canvasmind Mi-cerebro
```

## Versiones Estables Actuales

- `v1.0.0-estable` - Primera versión estable (9 Diciembre 2024)
