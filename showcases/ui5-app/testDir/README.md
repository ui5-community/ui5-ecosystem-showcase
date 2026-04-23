# Additional Directories in Zip File

This is a sample folder that should be copied with all content into the zip
file using builder task `ui5-task-zipper` using the configuration property
`additionalDirectories`

Below is an example configuration:

```yaml
builder:
  customTasks:
    - name: ui5-task-zipper
      afterTask: generateVersionInfo
      configuration:
        debug: true
        archiveName: "customZipName"
        additionalDirectories:
          - testDir
```