# UI5 task for zipping all project resources

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling zipping.

## Mandatory Requirements

-   [maven](https://maven.apache.org) installed
-   `pom.xml`: you need a valid pom.xml file in the directory of your choice.   
  see included `pom-exmaple.xml` for an example
-   `settings.xml` 
    - within your maven-repository location, you need a `settings.xml` pointing to the `jar`-remote repository location
    - default: `~/.m2/settings.xml` 

## Install

```bash
npm install ui5-task-mvn-lib-provider --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

-   debug: `{boolean}`; default: `true`  
    Verbose logging

-   (optional) pom: `{String}`  
    path to your pom.xml file, otherwise it will look at the root directory for the pom file

-   (optional) mvnSrcDir: `{String}`
    if you want to unpack only specific subdirectories of the dependencies, otherwise it will unpack all directories of the dependencies

-   (optional) targetDir: `{String}`
    path where the dependencies should be unpacked, otherwise it will create a directory(`unpacked-mvn-dependencies`) on the root directory

-   (optional) groupId: `{Array}`
    only unpack dependencies with a specific groupId, otherwise it will unpack all dependencies defined in the pom.xml

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-mvn-dependency-provider": "*"
    // ...
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-mvn-dependency-provider",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-mvn-dependency-provider
    afterTask: uglify 
    configuration:
      debug: true
      groupId:
        - com.jssoft.groupId
      mvnSrcDir: META-INF/resources/sap
      targetDir: ./webapp/resources/sap
```

## How it works

this task downloads ui5 sources (think: libraries) masked as maven `.jar` dependencies and unpacks them to a location of your choice. 

It spawns a locally installed `mvn` process and fires off the depencendy plugin à la `mvn depencedy:unpack-dependencies` with optionally scoped `groupId`s.




## License

This work is [dual-licensed](../../LICENSE) under Apache 2.0 and the Derived Beer-ware License. The official license will be Apache 2.0 but finally you can choose between one of them if you use this work.

When you like this stuff, buy [@vobu](https://twitter.com/vobu) or Simon Coen a beer or buy [@pmuessig](https://twitter.com/pmuessig) a coke when you see them.
