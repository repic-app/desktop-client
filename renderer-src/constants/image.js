export const acceptImageTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml', 'image/svg', 'image/webp', 'image/gif']

export const imagesTypesUsingCompressorJS = ['jpeg', 'jpg', 'png', 'webp']
export const imageTypesUsingSvgo = ['svg', 'svg+xml']
export const imageTypesUsingGiflossy = ['gif']

export const svgoOptions = {
  plugins: [
    {
      cleanupAttrs: true,
    }, {
      removeDoctype: true,
    },{
      removeXMLProcInst: true,
    },{
      removeComments: true,
    },{
      removeMetadata: true,
    },{
      removeTitle: true,
    },{
      removeDesc: true,
    },{
      removeUselessDefs: true,
    },{
      removeEditorsNSData: true,
    },{
      removeEmptyAttrs: true,
    },{
      removeHiddenElems: true,
    },{
      removeEmptyText: true,
    },{
      removeEmptyContainers: true,
    },{
      removeViewBox: false,
    },{
      cleanupEnableBackground: true,
    },{
      convertStyleToAttrs: true,
    },{
      convertColors: true,
    },{
      convertPathData: true,
    },{
      convertTransform: true,
    },{
      removeUnknownsAndDefaults: true,
    },{
      removeNonInheritableGroupAttrs: true,
    },{
      removeUselessStrokeAndFill: true,
    },{
      removeUnusedNS: true,
    },{
      cleanupIDs: true,
    },{
      cleanupNumericValues: true,
    },{
      moveElemsAttrsToGroup: true,
    },{
      moveGroupAttrsToElems: true,
    },{
      collapseGroups: true,
    },{
      removeRasterImages: false,
    },{
      mergePaths: true,
    },{
      convertShapeToPath: true,
    },{
      sortAttrs: true,
    },{
      removeDimensions: true,
    }
  ]
}