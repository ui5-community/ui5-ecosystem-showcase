# UI5 task for turning a UI5 App into a PWA

[What are Progressive Web Apps (PWAs)?](https://web.dev/progressive-web-apps/)

## Install

tbd
# TODO 
- readme
- github pages
- license
- installation guide
- folder naming

## Configuration options (in `$yourapp/ui5.yaml`)

If you are familiar with jsonschema check out the config.json.

### `serviceWorker`

`strategy`

Defines how the service worker should behave. Possible values are

* `Offline-Page` The App will display a offline page when it cannot connect to the internet. Requires `offlinePage` parameter.
* `Offline-Copy` While browsing the App, the Service Worker captures all files and stores them in the cache.
* `Offline-Copy-With-Backup-Page` A combination of the above two. Requires `offlinePage` parameter.
* `Cache-First` This option pre-caches all given files and serves them from the cache first. Requires `preCacheFiles` parameter.
* `Advanced-Caching` With this option you have very granular control about which files should be cached, and which shouldn't. Requires all of the parameters below.

`offlinePage`: Sets the page that will be shown if the user is offline, should be a `.html` file somewhere in your project. Only required for `Offline-Page`, `Offline-Copy-With-Backup-Page`, `Advanced-Caching`.

`preCache`: List of [glob pattern](https://en.wikipedia.org/wiki/Glob_(programming)) that match the files that will be pre cached when the application starts. Only required for `Cache-First` and `Advanced-Caching` strategies.

`networkFirst`: List of regular expressions, everything that matches any of the expressions will be fetched from the network first and only served from cache when there is no network available. Only required for `Advanced-Caching`.

`avoidCaching`: List of regular expressions, everything that matches any of the expressions won't be cached. Only required for `Advanced-Caching`

### `manifest`

Whatever you supply here will be copied to the `manifest.webmanifest` file, you can read more about it at [web.dev](https://web.dev/add-manifest/). If a required parameter is missing a default value will be provided.

## Usage

### 1. Define the dependency in your `package.json`

```json
"devDependencies": {
    "ui5-task-pwa-enabler": "*"
},
"ui5": {
    "dependencies": [
        "ui5-task-pwa-enabler"
    ]
}
```

### 2. Configure it in your `ui5.yaml`

This is a example configuration for an advanced service worker and some custom manifest parameters.

```yaml
specVersion: '1.0'
metadata:
  name: openui5-sample-app
type: application
resources:
  configuration:
    propertiesFileSourceEncoding: "UTF-8"
builder:
  customTasks:
    - name: pwaEnabler
      afterTask: generateVersionInfo
      configuration:
        serviceWorker:
          strategy: Advanced-Caching
          offlinePage: offline.html
          preCache:
            - controller/*
            - "*.html"
            - view/*
            - images/*
          networkFirst:
            - /\/api\/.*/
          avoidCaching:
            - /\/realtime-api\/.*/
        manifest:
          short_name: To-Do App
          name: To-Do App
          description: Sample to-do-app for testing pwaEnabler
          icons:
            - src: images/SAP_R_192.png
              type: image/png
              sizes: 192x192
            - src: images/SAP_R_512.png
              type: image/png
              sizes: 512x512
          start_url: /index.html
          scope: /
          background_color: "#EFF4F9"
          theme_color: "#3F5161"
          display: standalone
```

## How it works

Under the hood we are using the examples from the [pwabuilder](https://github.com/pwa-builder/pwabuilder-serviceworkers)
but we replaced the configuration part with templating and generate those values from the provided configuration.
Additionally we have to inject a few lines into the `index.html` to make sure everything is linked and tadaa, you have
your own fancy PWA.
