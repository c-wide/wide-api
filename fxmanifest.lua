fx_version("cerulean")

game("gta5")

version("0.2.0")

server_only("yes")

server_scripts({
    -- This is a file that lives purely in source code and isn't included
    -- in releases. It's used to detect whether a user can read or not.
    "build-detector.js",
    "dist/server.js",
})
