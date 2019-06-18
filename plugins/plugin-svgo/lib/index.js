const fs = require('fs')
const Svgo = require('svgo')

const svgoOptions = {
  plugins: [
    {
      cleanupAttrs: true,
    }, {
      removeDoctype: true,
    }, {
      removeXMLProcInst: true,
    }, {
      removeComments: true,
    }, {
      removeMetadata: true,
    }, {
      removeTitle: true,
    }, {
      removeDesc: true,
    }, {
      removeUselessDefs: true,
    }, {
      removeEditorsNSData: true,
    }, {
      removeEmptyAttrs: true,
    }, {
      removeHiddenElems: true,
    }, {
      removeEmptyText: true,
    }, {
      removeEmptyContainers: true,
    }, {
      removeViewBox: false,
    }, {
      cleanupEnableBackground: true,
    }, {
      convertStyleToAttrs: true,
    }, {
      convertColors: true,
    }, {
      convertPathData: true,
    }, {
      convertTransform: true,
    }, {
      removeUnknownsAndDefaults: true,
    }, {
      removeNonInheritableGroupAttrs: true,
    }, {
      removeUselessStrokeAndFill: true,
    }, {
      removeUnusedNS: true,
    }, {
      cleanupIDs: true,
    }, {
      cleanupNumericValues: true,
    }, {
      moveElemsAttrsToGroup: true,
    }, {
      moveGroupAttrsToElems: true,
    }, {
      collapseGroups: true,
    }, {
      removeRasterImages: false,
    }, {
      mergePaths: true,
    }, {
      convertShapeToPath: true,
    }, {
      sortAttrs: true,
    }, {
      removeDimensions: true,
    }
  ]
}

module.exports = async (task) => {

  const svgo = new Svgo(svgoOptions)
  const fileData = fs.readFileSync(task.path)
  return await svgo.optimize(fileData)

}