<div align="center">

# 🌐 Wide API

**A FiveM resource that provides an API to execute functions on the server.**

</div>

## 📚 Table of Contents

- [Getting Started](#-getting-started)
- [Register Your Own Paths](#-register-your-own-paths)
  - [Examples](#examples)
- [Resource Restarter](#-resource-restarter)
- [Handling Resource Restarts](#-handling-resource-restarts)
- [Access Keys](#-access-keys)
- [Caveats](#-caveats)
- [Acknowledgements](#-acknowledgements)

## 🚀 Getting Started

1. **Download** and unpack the release files.
2. **Place** the folder in your server's `resources` folder.
3. **Edit** the `config.json` file according to your preferences.
4. **Start** the resource.

## 🛠 Register Your Own Paths

This resource exposes a single export. Your route handler can return any data you want or a custom ApiResponse. See [Caveats](#-caveats) below.

```javascript
registerResourcePath(path: string, handler: (queryParams: Record<string, string>) => ApiResponse | unknown)
```

### Examples

- **Lua** (use the colon operator, not the dot operator)

```lua
exports["wide-api"]:registerResourcePath("yourPathName", function(queryParams)

end)
```

- **JavaScript** (queryParams type is `Record<string, string>`)

```javascript
globalThis.exports['wide-api'].registerResourcePath(
  'yourPathName',
  (queryParams) => {},
);
```

## 🔁 Resource Restarter

- Enable the 'ensure-resource' path in the `config.json` file.
- This path accepts one query parameter: `resourceName` (e.g. `/wide-api/ensure-resource?resourceName=baseevents/`).
- If using this path, the resource will require permission to use the "ensure", "start", and "stop" commands.

```
add_ace resource.wide-api command.ensure allow
add_ace resource.wide-api command.start allow
add_ace resource.wide-api command.stop allow
```

## 🔄 Handling Resource Restarts

- When the API starts listening, the 'wide-api:startServer' command is triggered.
- To handle resource restarts, listen for this event and re-register any paths you've created.

## 🔑 Access Keys

- Access keys should be added in the `config.json` file.
- If no access keys are provided, the server listens with unrestricted access.
- When access keys are specified, make sure to include an access key in the 'x-api-key' header for requests.
- Access keys should be added in the format: { description: string, key: string }

## ⚠️ Caveats

- All paths are prefixed with the name of the resource that registered it (e.g., /wide-api/ensure-resource/).
- If your route handler's returned value doesn't conform to the ApiResponse type, the API defaults to a 200 response code and includes your returned data under the "data" key in the API response. For more information, refer to the [ApiResponse type implementation](https://github.com/c-wide/wide-api/blob/acbee784552da106dc45106b058cb9cffde6d95b/src/response.ts#L25).

## 🙌 Acknowledgements

- [AvarianKnight](https://github.com/AvarianKnight) for the idea and rough draft.
- [Project Error](https://github.com/project-error) for the version checker and build detector.
