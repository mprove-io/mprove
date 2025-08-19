export function diskFilesToBlockmlFiles(diskFiles: DiskCatalogFile[]) {
  return diskFiles.map(x => {
    let blockmlFile: BmlFile = {
      content: x.content,
      name: x.name,
      path: x.fileNodeId
    };
    return blockmlFile;
  });
}
