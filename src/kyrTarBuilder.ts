import { Dirent } from "fs";
import { zstdCompress } from "node:zlib";
import { promisify } from "node:util";
import * as tar from "tar";
import fs from "fs";
import path from "path";

/**
 * The options object for config of 'buildTar'.
 * @param overrideEnv Collect any .env file from the project base dir.
 * @param distDir Suggested dir for main dist files.
 * @param dataDir Suggested additional dir for static project data files such as yaml, json, xml etc.
 * @param prismaDir Suggested additional dir for static prisma data files such as schema and migrations folder.
 * @param webServerDir Suggested additional dir for App WebServer files templates, static resources etc.
 * @param additionalDirs List any extra dirs for filterless collection of everything contained.
 */
export type TarBuildOptions = {
  overrideEnv: boolean;
  distDir?: string;
  dataDir?: string;
  prismaDir?: string;
  webServerDir?: string;
  additionalDirs?: string[];
};

const sudoArchDir = "./sudoTarZst";

function walkDir(
  dir: string,
  filter?: (relativePath: string, dirEnt: Dirent<string>) => boolean,
  fileList: string[] = [],
): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(dir, entry.name);
    if (filter && !filter(relativePath, entry)) continue;
    if (entry.isDirectory()) {
      walkDir(relativePath, filter, fileList);
    } else {
      fileList.push(relativePath);
    }
  }
  return fileList;
}

/**
 * Build a .tar and .tar.zst archive for "typical" npm/node projects for server uploads (suggested project structure found in readme.md). Use the 'TarBuildOptions' class to walk a list of dirs (some preset, and an optional list arguement). The /dist directory will be walked and collected indiscriminately
 * @param buildTarOptions - TarBuildOptions Object for config.
 * @returns Void, (a .tar and a .tar.zst will be written into the base project dir as `project.tar` & `project.tar.zst` respectively).
 */
export function buildTar(buildTarOptions: TarBuildOptions): Promise<void> {
  fs.rmSync(sudoArchDir, { recursive: true, force: true });
  fs.mkdirSync(sudoArchDir, { recursive: true });

  if (buildTarOptions.distDir !== undefined) {
    const distFiles = walkDir(buildTarOptions.distDir, (path, dirEnt) => {
      return true;
    });
    for (const filePath of distFiles) {
      const fileName = path.relative(buildTarOptions.distDir, filePath);
      const targetPath = path.join(sudoArchDir, fileName);
      fs.cpSync(filePath, targetPath);
    }
  }

  if (buildTarOptions.dataDir !== undefined) {
    const dataFiles = walkDir(buildTarOptions.dataDir, (path, dirEnt) => {
      return (
        dirEnt.name.toLowerCase().endsWith(`.yml`) ||
        dirEnt.name.toLowerCase().endsWith(`.yaml`) ||
        dirEnt.name.toLowerCase().endsWith(`.json`) ||
        dirEnt.name.toLowerCase().endsWith(`.xml`) ||
        dirEnt.name.toLowerCase().endsWith(`.ini`) ||
        dirEnt.name.toLowerCase().endsWith(`.csv`)
      );
    });
    for (const filePath of dataFiles) {
      const fileName = path.relative(buildTarOptions.dataDir, filePath);
      const targetPath = path.join(sudoArchDir, `data`, fileName);
      fs.cpSync(filePath, targetPath);
    }
  }

  if (buildTarOptions.prismaDir !== undefined) {
    const prismaFiles = walkDir(buildTarOptions.prismaDir, (path, dirEnt) => {
      return true;
    });
    for (const filePath of prismaFiles) {
      const fileName = path.relative(buildTarOptions.prismaDir, filePath);
      const targetPath = path.join(sudoArchDir, `prisma`, fileName);
      fs.cpSync(filePath, targetPath);
    }
  }

  if (buildTarOptions.webServerDir !== undefined) {
    const webServerFiles = walkDir(
      buildTarOptions.webServerDir,
      (path, dirEnt) => !dirEnt.name.toLowerCase().endsWith(`.ts`),
    );
    for (const filePath of webServerFiles) {
      const sectionFileName = path.relative(buildTarOptions.webServerDir, filePath);
      const targetPath = path.join(sudoArchDir, sectionFileName);
      fs.cpSync(filePath, targetPath);
    }
  }

  if (buildTarOptions.additionalDirs !== undefined) {
    for (const dir of buildTarOptions.additionalDirs) {
      const additionalCollection = walkDir(dir);
      for (const filePath of additionalCollection) {
        const targetPath = path.join(sudoArchDir, filePath);
        fs.cpSync(filePath, targetPath);
      }
    }
  }
  return compressFile();
}

async function compressFile() {
  await tar.create(
    {
      file: "project.tar",
      cwd: sudoArchDir,
    },
    ["."],
  );
  const tarFile = fs.readFileSync(`./project.tar`);
  const tarZstFile = await promisify(zstdCompress)(tarFile);
  fs.writeFileSync(`project.tar.zst`, tarZstFile);
}
