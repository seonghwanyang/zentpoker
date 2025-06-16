self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
<<<<<<< HEAD
  "devFiles": [],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [
    "static/chunks/webpack.js",
    "static/chunks/main-app.js"
  ],
  "pages": {
    "/_app": []
=======
  "devFiles": [
    "static/chunks/fallback/react-refresh.js"
  ],
  "ampDevFiles": [
    "static/chunks/fallback/webpack.js",
    "static/chunks/fallback/amp.js"
  ],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/_app": [
      "static/chunks/fallback/webpack.js",
      "static/chunks/fallback/main.js",
      "static/chunks/fallback/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/fallback/webpack.js",
      "static/chunks/fallback/main.js",
      "static/chunks/fallback/pages/_error.js"
    ]
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];