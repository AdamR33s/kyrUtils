# KYR Utils
This library contains a number of "utility" functions used in KYR projects. Please feel free to use!

I've listed the functions available and their general usage below.


### buildTar()
This builder function is used to walk relevant (and optional) project directories, collecting project files into a .tar.zst archive. 

This script assumes it will be executed from inside the `./dist` folder of your project. Use the `TarBuildOptions` class in your build script to control config. Some of the preset directory options have filters in place, there's also room for additional directories to be walked indiscriminately.
```text
FILTERS
The `./dist` directory walker has no filters and will walk and collect everything from all directories in this list. (Copy package files here)
The optional Data directory walker will filter any ( .yml | .yaml | .json | .xml | .ini | .csv ) files.
The optional Prisma directory walker will only select files with the .prisma extension.
The optional WebServer directory walker will ignore any files ending with `*.ts` - This is to walk and collect all templates, static resources and css files.
The optional Additional directory walker has no filters and will walk and collect everything from all directories in this list.
```

### BuildTarOptions
This object is built and then passed as an argument to the `buildTar()` function.
```cs
export type TarBuildOptions = {
  overrideEnv: boolean;
  dataDir?: string;
  prismaDir?: string;
  webServerDir?: string;
  additionalDirs?: string[];
};
```

#### Tar(Zst)Builder - Project Structure
Following this structure will allow you to import and use the buildTar() utility for rapid server deployment via a .tar.zst archive.
```text
STRUCTURE
projectRoot:                    ./
projectRoot/.env ->             .env config files. *OPTIONAL*
projectRoot/data ->             Static datafiles for apps (YAML / JSON etc.) *OPTIONAL*
projectRoot/prisma ->           Static prisma files for ORM usage (schema etc.) *OPTIONAL*
projectRoot/src ->              Local deploy script (imports tarBuild() and compiles to `./dist`) & project TS files
projectRoot/src/webServer ->    Webserver.ts files, /views directory, /static directory  *OPTIONAL*
```

### getRandUUID()
Return a UUID from the Crypto library

### sleep()
Wait a defined number of seconds

### minutesElapsed()
Return a boolean from a Date object (time to judge from), and a number (number of minutes to check as passed since the Date object)

### hoursElapsed()
Return a boolean from a Date object (time to judge from), and a number (number of hours to check as passed since the Date object)

### shuffleArray()
Shuffle an Array using the Fisher-Yates algorithm

### chooseRandomFromArray()
Select a random element from an Array

### dateTimeUIString()
Return a UI-friendly date-stamp ("en-gb") from a String | Number | Date

### dateTimeFSString()
Return a filesystem-friendly date-stamp ("en-gb") from a String | Number | Date



# VERSION NOTES

### kyrUtils v1.0.0
- Project Tar Building working for S.C.a.R.S and CM

### kyrUtils v1.1.0
- Update to grab project file (package & package-lock)

### kyrUtils v1.2.0
- Added additional Dir's list option

### kyrUtilsInternal v1.3.0
- Changed name to kyrUtilsInternal to allow public repo

### kyrUtils v2.0.0
- Changed name back 
- Corrected structure
- Added tsdown for packaging public libraries
- Commented all exported functions
- Moved to "entrypoint" file structure
- Cleaned dependencies
- Added env override option to tar builder

### kyrUtils v2.0.0
- Package.json update

### kyrUtils v2.0.1
- Readme update

### kyrUtils v2.0.2
- Fixed import and require definitions
- Function names updated
- Function descriptions updated
- Readme updated

### kyrUtils v2.0.3
- Readme updated

### kyrUtils v2.0.4
- Readme updated

### kyrUtils v2.0.5
- Function names updated
- Function descriptions updated

### kyrUtils v2.0.6
- Internal package manager changed to PNPM
- Removed async from date functions
- Removed async from tarBuild (refactored async compression function)
- Added PNPM compatibility to buildTar filters (pnpm-lock.yaml & pnpm-workspace.yaml)

### kyrUtils v2.0.7
- Added support for new Prisma versions 7.x

### kyrUtils v2.0.8
- Bug fix for Prisma versions 7.x (Grabbing prisma.config.ts) from project root
- Version notes added to readme

### kyrUtils v2.0.9
- /prisma now collected indiscriminately 

### kyrUtils v2.1.0
- Removed projFiles collection (move package files to dist through your script!)

### kyrUtils v2.1.1
- Fix an issue with files in dataDir being filtered out incorrectly
