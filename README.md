# Wide API

## Description

A resource for FiveM that provides an API to execute functions on the server.

### Getting Started

1. Download & unpack the release files.
2. Place the folder in your servers resources folder.
3. Edit the config.json file if desired.
4. Start the resource.

Note: All paths are prefixed with the name of the resource that registered it. (/wide-api/ensure-resource/)

### Register your own paths

- This resource exposes one export:

```
registerResourcePath(path: string, handler: (queryParams: Record<string, string>) => ApiResponse | void)
```

### Resource restarter

- To use the 'ensure-resource' path, make sure it is enabled in the config.json file.
- This path accepts one query parameter "resourceName". (/wide-api/ensure-resource?resourceName=baseevents/)
- If using this path the resource will require the permission to use the "ensure", "start", and "stop" commands.

```
add_ace resource.wide-api command.ensure allow
add_ace resource.wide-api command.start allow
add_ace resource.wide-api command.stop allow
```

### Handling resource restarts

- When the API starts listening the 'wide-api:startServer' command is triggered.
- When creating your own paths you can listen for this event and re-register any paths you've created.

### Access Keys

- Access keys should be added in the config.json file.
- If no access keys are provided, the server listens with unrestricted access.
- If you do provide access keys then you must provide an access key in the 'x-api-key' header.
- Access keys should be added in the format: { description: string, key: string }

### Acknowledgements

- [AvarianKnight](https://github.com/AvarianKnight) for the idea and rough draft.
