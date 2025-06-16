"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_user_Desktop_Business_Zent_poker_Zentpoker_code_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\user\\\\Desktop\\\\Business\\\\Zent_poker\\\\Zentpoker_code\\\\src\\\\app\\\\api\\\\auth\\\\[...nextauth]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_user_Desktop_Business_Zent_poker_Zentpoker_code_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUN1c2VyJTVDRGVza3RvcCU1Q0J1c2luZXNzJTVDWmVudF9wb2tlciU1Q1plbnRwb2tlcl9jb2RlJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUN1c2VyJTVDRGVza3RvcCU1Q0J1c2luZXNzJTVDWmVudF9wb2tlciU1Q1plbnRwb2tlcl9jb2RlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUM0RDtBQUN6STtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3plbnRwb2tlci8/OTNhMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcQnVzaW5lc3NcXFxcWmVudF9wb2tlclxcXFxaZW50cG9rZXJfY29kZVxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXFsuLi5uZXh0YXV0aF1cXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXEJ1c2luZXNzXFxcXFplbnRfcG9rZXJcXFxcWmVudHBva2VyX2NvZGVcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxbLi4ubmV4dGF1dGhdXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth_auth_options__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth/auth-options */ \"(rsc)/./src/lib/auth/auth-options.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth_auth_options__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBaUM7QUFDcUI7QUFFdEQsTUFBTUUsVUFBVUYsZ0RBQVFBLENBQUNDLCtEQUFXQTtBQUVPIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vemVudHBva2VyLy4vc3JjL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzPzAwOTgiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoIGZyb20gJ25leHQtYXV0aCc7XG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgvYXV0aC1vcHRpb25zJztcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9O1xuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiYXV0aE9wdGlvbnMiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth/auth-options.ts":
/*!**************************************!*\
  !*** ./src/lib/auth/auth-options.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n\n// 개발 환경용 임시 설정\nconst isDevelopment = \"development\" === \"development\";\nconst authOptions = {\n    // DB 없이 JWT 세션만 사용 (개발 테스트용)\n    // adapter: PrismaAdapter(prisma),\n    providers: [\n        // 개발 환경에서는 Credentials Provider로 테스트\n        ...isDevelopment ? [\n            {\n                id: \"credentials\",\n                name: \"Test Login\",\n                type: \"credentials\",\n                credentials: {\n                    email: {\n                        label: \"Email\",\n                        type: \"email\",\n                        placeholder: \"test@example.com\"\n                    },\n                    password: {\n                        label: \"Password\",\n                        type: \"password\"\n                    }\n                },\n                async authorize (credentials) {\n                    // 테스트용 사용자\n                    if (credentials?.email === \"admin@test.com\") {\n                        return {\n                            id: \"1\",\n                            email: \"admin@test.com\",\n                            name: \"관리자\",\n                            role: \"ADMIN\",\n                            tier: \"REGULAR\",\n                            status: \"ACTIVE\",\n                            points: 1000000\n                        };\n                    }\n                    if (credentials?.email === \"user@test.com\") {\n                        return {\n                            id: \"2\",\n                            email: \"user@test.com\",\n                            name: \"일반회원\",\n                            role: \"USER\",\n                            tier: \"REGULAR\",\n                            status: \"ACTIVE\",\n                            points: 50000\n                        };\n                    }\n                    if (credentials?.email === \"guest@test.com\") {\n                        return {\n                            id: \"3\",\n                            email: \"guest@test.com\",\n                            name: \"게스트\",\n                            role: \"USER\",\n                            tier: \"GUEST\",\n                            status: \"ACTIVE\",\n                            points: 10000\n                        };\n                    }\n                    return null;\n                }\n            }\n        ] : [],\n        // Google Provider는 실제 클라이언트 ID가 있을 때만 활성화\n        ...process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== \"your-google-client-id.apps.googleusercontent.com\" ? [\n            (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n                clientId: process.env.GOOGLE_CLIENT_ID,\n                clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n                authorization: {\n                    params: {\n                        prompt: \"consent\",\n                        access_type: \"offline\",\n                        response_type: \"code\"\n                    }\n                }\n            })\n        ] : []\n    ],\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            console.log(\"signIn attempt\", {\n                userId: user.id,\n                provider: account?.provider,\n                email: user.email\n            });\n            return true;\n        },\n        async redirect ({ url, baseUrl }) {\n            console.log(\"redirect\", {\n                url: url.startsWith(baseUrl) ? \"internal\" : \"external\"\n            });\n            // 로그인 후 대시보드로 리다이렉트\n            if (url.startsWith(\"/\")) {\n                return `${baseUrl}${url}`;\n            } else if (url.startsWith(baseUrl)) {\n                return url;\n            }\n            return baseUrl + \"/dashboard\";\n        },\n        async session ({ session, token, user }) {\n            if (session?.user) {\n                // JWT 모드에서는 token 사용\n                if (token) {\n                    session.user.id = token.id;\n                    session.user.role = token.role || \"USER\";\n                    session.user.tier = token.tier || \"GUEST\";\n                    session.user.status = token.status || \"ACTIVE\";\n                    session.user.points = token.points || 0;\n                    session.user.memberGrade = token.tier === \"GUEST\" ? \"GUEST\" : \"REGULAR\";\n                    session.user.phone = token.phone;\n                }\n            }\n            return session;\n        },\n        async jwt ({ token, user, account }) {\n            if (account && user) {\n                const extendedUser = user;\n                return {\n                    ...token,\n                    id: extendedUser.id,\n                    role: extendedUser.role || \"USER\",\n                    tier: extendedUser.tier || \"GUEST\",\n                    status: extendedUser.status || \"ACTIVE\",\n                    points: extendedUser.points || 0,\n                    memberGrade: extendedUser.tier === \"GUEST\" ? \"GUEST\" : \"REGULAR\",\n                    phone: extendedUser.phone\n                };\n            }\n            return token;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        signOut: \"/\",\n        error: \"/login\"\n    },\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    secret: process.env.NEXTAUTH_SECRET || \"development-secret-key\",\n    debug: isDevelopment\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxPQUFPckQ7QUFDVCxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vemVudHBva2VyLy4vc3JjL2xpYi9hdXRoL2F1dGgtb3B0aW9ucy50cz84ZGMzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gJ25leHQtYXV0aCc7XG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9nb29nbGUnO1xuLy8gaW1wb3J0IHsgUHJpc21hQWRhcHRlciB9IGZyb20gJ0BuZXh0LWF1dGgvcHJpc21hLWFkYXB0ZXInO1xuLy8gaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQC9saWIvcHJpc21hJztcbmltcG9ydCB7IFVzZXJSb2xlLCBVc2VyVGllciwgVXNlclN0YXR1cywgTWVtYmVyR3JhZGUgfSBmcm9tICdAL3R5cGVzL25leHQtYXV0aCc7XG4vLyBpbXBvcnQgeyBsb2dBdXRoLCBsb2dFcnJvciB9IGZyb20gJ0AvbGliL3V0aWxzL2xvZ2dlcic7XG5cbi8vIFByaXNtYSDslrTrjJHthLDrpbwg7JyE7ZWcIO2DgOyehSDtmZXsnqVcbmludGVyZmFjZSBFeHRlbmRlZFVzZXIge1xuICBpZDogc3RyaW5nO1xuICBlbWFpbDogc3RyaW5nO1xuICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsO1xuICByb2xlPzogVXNlclJvbGU7XG4gIHRpZXI/OiBVc2VyVGllcjtcbiAgc3RhdHVzPzogVXNlclN0YXR1cztcbiAgcG9pbnRzPzogbnVtYmVyO1xuICBtZW1iZXJHcmFkZT86IE1lbWJlckdyYWRlO1xuICBwaG9uZT86IHN0cmluZyB8IG51bGw7XG59XG5cbi8vIOqwnOuwnCDtmZjqsr3smqkg7J6E7IucIOyEpOyglVxuY29uc3QgaXNEZXZlbG9wbWVudCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnO1xuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcbiAgLy8gREIg7JeG7J20IEpXVCDshLjshZjrp4wg7IKs7JqpICjqsJzrsJwg7YWM7Iqk7Yq47JqpKVxuICAvLyBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIC8vIOqwnOuwnCDtmZjqsr3sl5DshJzripQgQ3JlZGVudGlhbHMgUHJvdmlkZXLroZwg7YWM7Iqk7Yq4XG4gICAgLi4uKGlzRGV2ZWxvcG1lbnQgPyBbXG4gICAgICB7XG4gICAgICAgIGlkOiAnY3JlZGVudGlhbHMnLFxuICAgICAgICBuYW1lOiAnVGVzdCBMb2dpbicsXG4gICAgICAgIHR5cGU6ICdjcmVkZW50aWFscycgYXMgY29uc3QsXG4gICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiRW1haWxcIiwgdHlwZTogXCJlbWFpbFwiLCBwbGFjZWhvbGRlcjogXCJ0ZXN0QGV4YW1wbGUuY29tXCIgfSxcbiAgICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJQYXNzd29yZFwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxuICAgICAgICB9LFxuICAgICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAvLyDthYzsiqTtirjsmqkg7IKs7Jqp7J6QXG4gICAgICAgICAgaWYgKGNyZWRlbnRpYWxzPy5lbWFpbCA9PT0gJ2FkbWluQHRlc3QuY29tJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaWQ6ICcxJyxcbiAgICAgICAgICAgICAgZW1haWw6ICdhZG1pbkB0ZXN0LmNvbScsXG4gICAgICAgICAgICAgIG5hbWU6ICfqtIDrpqzsnpAnLFxuICAgICAgICAgICAgICByb2xlOiAnQURNSU4nIGFzIFVzZXJSb2xlLFxuICAgICAgICAgICAgICB0aWVyOiAnUkVHVUxBUicgYXMgVXNlclRpZXIsXG4gICAgICAgICAgICAgIHN0YXR1czogJ0FDVElWRScgYXMgVXNlclN0YXR1cyxcbiAgICAgICAgICAgICAgcG9pbnRzOiAxMDAwMDAwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNyZWRlbnRpYWxzPy5lbWFpbCA9PT0gJ3VzZXJAdGVzdC5jb20nKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogJzInLFxuICAgICAgICAgICAgICBlbWFpbDogJ3VzZXJAdGVzdC5jb20nLFxuICAgICAgICAgICAgICBuYW1lOiAn7J2867CY7ZqM7JuQJyxcbiAgICAgICAgICAgICAgcm9sZTogJ1VTRVInIGFzIFVzZXJSb2xlLFxuICAgICAgICAgICAgICB0aWVyOiAnUkVHVUxBUicgYXMgVXNlclRpZXIsXG4gICAgICAgICAgICAgIHN0YXR1czogJ0FDVElWRScgYXMgVXNlclN0YXR1cyxcbiAgICAgICAgICAgICAgcG9pbnRzOiA1MDAwMCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjcmVkZW50aWFscz8uZW1haWwgPT09ICdndWVzdEB0ZXN0LmNvbScpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGlkOiAnMycsXG4gICAgICAgICAgICAgIGVtYWlsOiAnZ3Vlc3RAdGVzdC5jb20nLFxuICAgICAgICAgICAgICBuYW1lOiAn6rKM7Iqk7Yq4JyxcbiAgICAgICAgICAgICAgcm9sZTogJ1VTRVInIGFzIFVzZXJSb2xlLFxuICAgICAgICAgICAgICB0aWVyOiAnR1VFU1QnIGFzIFVzZXJUaWVyLFxuICAgICAgICAgICAgICBzdGF0dXM6ICdBQ1RJVkUnIGFzIFVzZXJTdGF0dXMsXG4gICAgICAgICAgICAgIHBvaW50czogMTAwMDAsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0gOiBbXSksXG4gICAgLy8gR29vZ2xlIFByb3ZpZGVy64qUIOyLpOygnCDtgbTrnbzsnbTslrjtirggSUTqsIAg7J6I7J2EIOuVjOunjCDtmZzshLHtmZRcbiAgICAuLi4ocHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCAmJiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX1NFQ1JFVCAmJiBcbiAgICAgICAgcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCAhPT0gJ3lvdXItZ29vZ2xlLWNsaWVudC1pZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScgPyBbXG4gICAgICBHb29nbGVQcm92aWRlcih7XG4gICAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEISxcbiAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX1NFQ1JFVCEsXG4gICAgICAgIGF1dGhvcml6YXRpb246IHtcbiAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgIHByb21wdDogXCJjb25zZW50XCIsXG4gICAgICAgICAgICBhY2Nlc3NfdHlwZTogXCJvZmZsaW5lXCIsXG4gICAgICAgICAgICByZXNwb25zZV90eXBlOiBcImNvZGVcIlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICBdIDogW10pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBzaWduSW4oeyB1c2VyLCBhY2NvdW50LCBwcm9maWxlIH0pIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzaWduSW4gYXR0ZW1wdCcsIHsgXG4gICAgICAgIHVzZXJJZDogdXNlci5pZCwgXG4gICAgICAgIHByb3ZpZGVyOiBhY2NvdW50Py5wcm92aWRlcixcbiAgICAgICAgZW1haWw6IHVzZXIuZW1haWxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBhc3luYyByZWRpcmVjdCh7IHVybCwgYmFzZVVybCB9KSB7XG4gICAgICBjb25zb2xlLmxvZygncmVkaXJlY3QnLCB7IHVybDogdXJsLnN0YXJ0c1dpdGgoYmFzZVVybCkgPyAnaW50ZXJuYWwnIDogJ2V4dGVybmFsJyB9KTtcbiAgICAgIC8vIOuhnOq3uOyduCDtm4Qg64yA7Iuc67O065Oc66GcIOumrOuLpOydtOugie2KuFxuICAgICAgaWYgKHVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9JHt1cmx9YDtcbiAgICAgIH0gZWxzZSBpZiAodXJsLnN0YXJ0c1dpdGgoYmFzZVVybCkpIHtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlVXJsICsgJy9kYXNoYm9hcmQnO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmIChzZXNzaW9uPy51c2VyKSB7XG4gICAgICAgIC8vIEpXVCDrqqjrk5zsl5DshJzripQgdG9rZW4g7IKs7JqpXG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHNlc3Npb24udXNlci5pZCA9IHRva2VuLmlkIGFzIHN0cmluZztcbiAgICAgICAgICBzZXNzaW9uLnVzZXIucm9sZSA9IHRva2VuLnJvbGUgYXMgVXNlclJvbGUgfHwgJ1VTRVInO1xuICAgICAgICAgIHNlc3Npb24udXNlci50aWVyID0gdG9rZW4udGllciBhcyBVc2VyVGllciB8fCAnR1VFU1QnO1xuICAgICAgICAgIHNlc3Npb24udXNlci5zdGF0dXMgPSB0b2tlbi5zdGF0dXMgYXMgVXNlclN0YXR1cyB8fCAnQUNUSVZFJztcbiAgICAgICAgICBzZXNzaW9uLnVzZXIucG9pbnRzID0gdG9rZW4ucG9pbnRzIGFzIG51bWJlciB8fCAwO1xuICAgICAgICAgIHNlc3Npb24udXNlci5tZW1iZXJHcmFkZSA9IHRva2VuLnRpZXIgPT09ICdHVUVTVCcgPyAnR1VFU1QnIDogJ1JFR1VMQVInO1xuICAgICAgICAgIHNlc3Npb24udXNlci5waG9uZSA9IHRva2VuLnBob25lIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyLCBhY2NvdW50IH0pIHtcbiAgICAgIGlmIChhY2NvdW50ICYmIHVzZXIpIHtcbiAgICAgICAgY29uc3QgZXh0ZW5kZWRVc2VyID0gdXNlciBhcyBhbnk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4udG9rZW4sXG4gICAgICAgICAgaWQ6IGV4dGVuZGVkVXNlci5pZCxcbiAgICAgICAgICByb2xlOiBleHRlbmRlZFVzZXIucm9sZSB8fCAnVVNFUicsXG4gICAgICAgICAgdGllcjogZXh0ZW5kZWRVc2VyLnRpZXIgfHwgJ0dVRVNUJyxcbiAgICAgICAgICBzdGF0dXM6IGV4dGVuZGVkVXNlci5zdGF0dXMgfHwgJ0FDVElWRScsXG4gICAgICAgICAgcG9pbnRzOiBleHRlbmRlZFVzZXIucG9pbnRzIHx8IDAsXG4gICAgICAgICAgbWVtYmVyR3JhZGU6IGV4dGVuZGVkVXNlci50aWVyID09PSAnR1VFU1QnID8gJ0dVRVNUJyA6ICdSRUdVTEFSJyxcbiAgICAgICAgICBwaG9uZTogZXh0ZW5kZWRVc2VyLnBob25lLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46ICcvbG9naW4nLFxuICAgIHNpZ25PdXQ6ICcvJyxcbiAgICBlcnJvcjogJy9sb2dpbicsXG4gIH0sXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogJ2p3dCcsIC8vIERCIOyXhuydtCBKV1Qg7IKs7JqpXG4gICAgbWF4QWdlOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGF5c1xuICB9LFxuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCB8fCAnZGV2ZWxvcG1lbnQtc2VjcmV0LWtleScsXG4gIGRlYnVnOiBpc0RldmVsb3BtZW50LCAvLyDqsJzrsJwg7ZmY6rK97JeQ7ISc66eMIOuUlOuyhOq3uFxufTsiXSwibmFtZXMiOlsiR29vZ2xlUHJvdmlkZXIiLCJpc0RldmVsb3BtZW50IiwicHJvY2VzcyIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwiaWQiLCJuYW1lIiwidHlwZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInBsYWNlaG9sZGVyIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJyb2xlIiwidGllciIsInN0YXR1cyIsInBvaW50cyIsImVudiIsIkdPT0dMRV9DTElFTlRfSUQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsImNsaWVudElkIiwiY2xpZW50U2VjcmV0IiwiYXV0aG9yaXphdGlvbiIsInBhcmFtcyIsInByb21wdCIsImFjY2Vzc190eXBlIiwicmVzcG9uc2VfdHlwZSIsImNhbGxiYWNrcyIsInNpZ25JbiIsInVzZXIiLCJhY2NvdW50IiwicHJvZmlsZSIsImNvbnNvbGUiLCJsb2ciLCJ1c2VySWQiLCJwcm92aWRlciIsInJlZGlyZWN0IiwidXJsIiwiYmFzZVVybCIsInN0YXJ0c1dpdGgiLCJzZXNzaW9uIiwidG9rZW4iLCJtZW1iZXJHcmFkZSIsInBob25lIiwiand0IiwiZXh0ZW5kZWRVc2VyIiwicGFnZXMiLCJzaWduT3V0IiwiZXJyb3IiLCJzdHJhdGVneSIsIm1heEFnZSIsInNlY3JldCIsIk5FWFRBVVRIX1NFQ1JFVCIsImRlYnVnIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth/auth-options.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/uuid","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/oidc-token-hash","vendor-chunks/preact","vendor-chunks/object-hash","vendor-chunks/lru-cache","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();