# PTA - Wayfinding - CMS App Mobile - Babylon Component

> Documentation can be
> find [here](https://github.com/ettspa/pta-mixed-wayfinding-cmsappmobile-docs/blob/develop/cms/map-editor/babylon-component.md)

## Requirements

- Project should be written in typescript
- Import only specific module, not the "group"

```
// Correct
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
// Wrong
import { FreeCamera } from '@babylonjs/core';
```

- Use `webpack` to build the project
- Do not hash the name of webpack build