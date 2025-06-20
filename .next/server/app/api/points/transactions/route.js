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
exports.id = "app/api/points/transactions/route";
exports.ids = ["app/api/points/transactions/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpoints%2Ftransactions%2Froute&page=%2Fapi%2Fpoints%2Ftransactions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpoints%2Ftransactions%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpoints%2Ftransactions%2Froute&page=%2Fapi%2Fpoints%2Ftransactions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpoints%2Ftransactions%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_user_Desktop_Business_Zent_poker_Zentpoker_code_src_app_api_points_transactions_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/points/transactions/route.ts */ \"(rsc)/./src/app/api/points/transactions/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/points/transactions/route\",\n        pathname: \"/api/points/transactions\",\n        filename: \"route\",\n        bundlePath: \"app/api/points/transactions/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\user\\\\Desktop\\\\Business\\\\Zent_poker\\\\Zentpoker_code\\\\src\\\\app\\\\api\\\\points\\\\transactions\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_user_Desktop_Business_Zent_poker_Zentpoker_code_src_app_api_points_transactions_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/points/transactions/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZwb2ludHMlMkZ0cmFuc2FjdGlvbnMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnBvaW50cyUyRnRyYW5zYWN0aW9ucyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnBvaW50cyUyRnRyYW5zYWN0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUN1c2VyJTVDRGVza3RvcCU1Q0J1c2luZXNzJTVDWmVudF9wb2tlciU1Q1plbnRwb2tlcl9jb2RlJTVDc3JjJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUN1c2VyJTVDRGVza3RvcCU1Q0J1c2luZXNzJTVDWmVudF9wb2tlciU1Q1plbnRwb2tlcl9jb2RlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUM2RDtBQUMxSTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3plbnRwb2tlci8/NTAzMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcQnVzaW5lc3NcXFxcWmVudF9wb2tlclxcXFxaZW50cG9rZXJfY29kZVxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxwb2ludHNcXFxcdHJhbnNhY3Rpb25zXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9wb2ludHMvdHJhbnNhY3Rpb25zL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvcG9pbnRzL3RyYW5zYWN0aW9uc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvcG9pbnRzL3RyYW5zYWN0aW9ucy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxCdXNpbmVzc1xcXFxaZW50X3Bva2VyXFxcXFplbnRwb2tlcl9jb2RlXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXHBvaW50c1xcXFx0cmFuc2FjdGlvbnNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3BvaW50cy90cmFuc2FjdGlvbnMvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpoints%2Ftransactions%2Froute&page=%2Fapi%2Fpoints%2Ftransactions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpoints%2Ftransactions%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/points/transactions/route.ts":
/*!**************************************************!*\
  !*** ./src/app/api/points/transactions/route.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth_auth_options__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth/auth-options */ \"(rsc)/./src/lib/auth/auth-options.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n\n\n\n\nasync function GET(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth_auth_options__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session?.user?.email) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Unauthorized\"\n            }, {\n                status: 401\n            });\n        }\n        const { searchParams } = new URL(request.url);\n        const page = parseInt(searchParams.get(\"page\") || \"1\");\n        const limit = parseInt(searchParams.get(\"limit\") || \"10\");\n        const type = searchParams.get(\"type\");\n        const status = searchParams.get(\"status\");\n        // 사용자 조회\n        const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n            where: {\n                email: session.user.email\n            }\n        });\n        if (!user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"User not found\"\n            }, {\n                status: 404\n            });\n        }\n        // 필터 조건 구성\n        const where = {\n            userId: user.id\n        };\n        if (type) where.type = type;\n        if (status) where.status = status;\n        // 전체 개수 조회\n        const total = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.transaction.count({\n            where\n        });\n        // 거래 내역 조회\n        const transactions = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.transaction.findMany({\n            where,\n            orderBy: {\n                createdAt: \"desc\"\n            },\n            skip: (page - 1) * limit,\n            take: limit\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            transactions,\n            pagination: {\n                total,\n                page,\n                limit,\n                totalPages: Math.ceil(total / limit)\n            }\n        });\n    } catch (error) {\n        console.error(\"Error fetching transactions:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal server error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9wb2ludHMvdHJhbnNhY3Rpb25zL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUEyQztBQUNFO0FBQ1M7QUFDaEI7QUFFL0IsZUFBZUksSUFBSUMsT0FBZ0I7SUFDeEMsSUFBSTtRQUNGLE1BQU1DLFVBQVUsTUFBTUwsMkRBQWdCQSxDQUFDQywrREFBV0E7UUFFbEQsSUFBSSxDQUFDSSxTQUFTQyxNQUFNQyxPQUFPO1lBQ3pCLE9BQU9SLHFEQUFZQSxDQUFDUyxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBZSxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDcEU7UUFFQSxNQUFNLEVBQUVDLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUlSLFFBQVFTLEdBQUc7UUFDNUMsTUFBTUMsT0FBT0MsU0FBU0osYUFBYUssR0FBRyxDQUFDLFdBQVc7UUFDbEQsTUFBTUMsUUFBUUYsU0FBU0osYUFBYUssR0FBRyxDQUFDLFlBQVk7UUFDcEQsTUFBTUUsT0FBT1AsYUFBYUssR0FBRyxDQUFDO1FBQzlCLE1BQU1OLFNBQVNDLGFBQWFLLEdBQUcsQ0FBQztRQUVoQyxTQUFTO1FBQ1QsTUFBTVYsT0FBTyxNQUFNSiwrQ0FBTUEsQ0FBQ0ksSUFBSSxDQUFDYSxVQUFVLENBQUM7WUFDeENDLE9BQU87Z0JBQUViLE9BQU9GLFFBQVFDLElBQUksQ0FBQ0MsS0FBSztZQUFDO1FBQ3JDO1FBRUEsSUFBSSxDQUFDRCxNQUFNO1lBQ1QsT0FBT1AscURBQVlBLENBQUNTLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUFpQixHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDdEU7UUFFQSxXQUFXO1FBQ1gsTUFBTVUsUUFBYTtZQUFFQyxRQUFRZixLQUFLZ0IsRUFBRTtRQUFDO1FBQ3JDLElBQUlKLE1BQU1FLE1BQU1GLElBQUksR0FBR0E7UUFDdkIsSUFBSVIsUUFBUVUsTUFBTVYsTUFBTSxHQUFHQTtRQUUzQixXQUFXO1FBQ1gsTUFBTWEsUUFBUSxNQUFNckIsK0NBQU1BLENBQUNzQixXQUFXLENBQUNDLEtBQUssQ0FBQztZQUFFTDtRQUFNO1FBRXJELFdBQVc7UUFDWCxNQUFNTSxlQUFlLE1BQU14QiwrQ0FBTUEsQ0FBQ3NCLFdBQVcsQ0FBQ0csUUFBUSxDQUFDO1lBQ3JEUDtZQUNBUSxTQUFTO2dCQUFFQyxXQUFXO1lBQU87WUFDN0JDLE1BQU0sQ0FBQ2hCLE9BQU8sS0FBS0c7WUFDbkJjLE1BQU1kO1FBQ1I7UUFFQSxPQUFPbEIscURBQVlBLENBQUNTLElBQUksQ0FBQztZQUN2QmtCO1lBQ0FNLFlBQVk7Z0JBQ1ZUO2dCQUNBVDtnQkFDQUc7Z0JBQ0FnQixZQUFZQyxLQUFLQyxJQUFJLENBQUNaLFFBQVFOO1lBQ2hDO1FBQ0Y7SUFDRixFQUFFLE9BQU9SLE9BQU87UUFDZDJCLFFBQVEzQixLQUFLLENBQUMsZ0NBQWdDQTtRQUM5QyxPQUFPVixxREFBWUEsQ0FBQ1MsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBd0IsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDN0U7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3plbnRwb2tlci8uL3NyYy9hcHAvYXBpL3BvaW50cy90cmFuc2FjdGlvbnMvcm91dGUudHM/OGE4NiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoJztcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9saWIvYXV0aC9hdXRoLW9wdGlvbnMnO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQC9saWIvcHJpc21hJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xuICAgIFxuICAgIGlmICghc2Vzc2lvbj8udXNlcj8uZW1haWwpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAgICBjb25zdCBwYWdlID0gcGFyc2VJbnQoc2VhcmNoUGFyYW1zLmdldCgncGFnZScpIHx8ICcxJyk7XG4gICAgY29uc3QgbGltaXQgPSBwYXJzZUludChzZWFyY2hQYXJhbXMuZ2V0KCdsaW1pdCcpIHx8ICcxMCcpO1xuICAgIGNvbnN0IHR5cGUgPSBzZWFyY2hQYXJhbXMuZ2V0KCd0eXBlJyk7XG4gICAgY29uc3Qgc3RhdHVzID0gc2VhcmNoUGFyYW1zLmdldCgnc3RhdHVzJyk7XG5cbiAgICAvLyDsgqzsmqnsnpAg7KGw7ZqMXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgZW1haWw6IHNlc3Npb24udXNlci5lbWFpbCB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VzZXIgbm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pO1xuICAgIH1cblxuICAgIC8vIO2VhO2EsCDsobDqsbQg6rWs7ISxXG4gICAgY29uc3Qgd2hlcmU6IGFueSA9IHsgdXNlcklkOiB1c2VyLmlkIH07XG4gICAgaWYgKHR5cGUpIHdoZXJlLnR5cGUgPSB0eXBlO1xuICAgIGlmIChzdGF0dXMpIHdoZXJlLnN0YXR1cyA9IHN0YXR1cztcblxuICAgIC8vIOyghOyytCDqsJzsiJgg7KGw7ZqMXG4gICAgY29uc3QgdG90YWwgPSBhd2FpdCBwcmlzbWEudHJhbnNhY3Rpb24uY291bnQoeyB3aGVyZSB9KTtcblxuICAgIC8vIOqxsOuemCDrgrTsl60g7KGw7ZqMXG4gICAgY29uc3QgdHJhbnNhY3Rpb25zID0gYXdhaXQgcHJpc21hLnRyYW5zYWN0aW9uLmZpbmRNYW55KHtcbiAgICAgIHdoZXJlLFxuICAgICAgb3JkZXJCeTogeyBjcmVhdGVkQXQ6ICdkZXNjJyB9LFxuICAgICAgc2tpcDogKHBhZ2UgLSAxKSAqIGxpbWl0LFxuICAgICAgdGFrZTogbGltaXQsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgdHJhbnNhY3Rpb25zLFxuICAgICAgcGFnaW5hdGlvbjoge1xuICAgICAgICB0b3RhbCxcbiAgICAgICAgcGFnZSxcbiAgICAgICAgbGltaXQsXG4gICAgICAgIHRvdGFsUGFnZXM6IE1hdGguY2VpbCh0b3RhbCAvIGxpbWl0KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgdHJhbnNhY3Rpb25zOicsIGVycm9yKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsInByaXNtYSIsIkdFVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwidXNlciIsImVtYWlsIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwicGFnZSIsInBhcnNlSW50IiwiZ2V0IiwibGltaXQiLCJ0eXBlIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwidXNlcklkIiwiaWQiLCJ0b3RhbCIsInRyYW5zYWN0aW9uIiwiY291bnQiLCJ0cmFuc2FjdGlvbnMiLCJmaW5kTWFueSIsIm9yZGVyQnkiLCJjcmVhdGVkQXQiLCJza2lwIiwidGFrZSIsInBhZ2luYXRpb24iLCJ0b3RhbFBhZ2VzIiwiTWF0aCIsImNlaWwiLCJjb25zb2xlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/points/transactions/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth/auth-options.ts":
/*!**************************************!*\
  !*** ./src/lib/auth/auth-options.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID,\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n            authorization: {\n                params: {\n                    prompt: \"consent\",\n                    access_type: \"offline\",\n                    response_type: \"code\"\n                }\n            }\n        })\n    ],\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            if (account?.provider === \"google\") {\n                try {\n                    // 사용자가 이미 존재하는지 확인\n                    const existingUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                        where: {\n                            email: user.email\n                        }\n                    });\n                    if (!existingUser) {\n                        // 관리자 이메일 확인\n                        const isAdmin = user.email === process.env.ADMIN_EMAIL;\n                        // 새 사용자 생성\n                        await _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.create({\n                            data: {\n                                email: user.email,\n                                name: user.name,\n                                image: user.image,\n                                role: isAdmin ? _prisma_client__WEBPACK_IMPORTED_MODULE_3__.Role.ADMIN : _prisma_client__WEBPACK_IMPORTED_MODULE_3__.Role.USER,\n                                grade: isAdmin ? _prisma_client__WEBPACK_IMPORTED_MODULE_3__.MemberGrade.ADMIN : _prisma_client__WEBPACK_IMPORTED_MODULE_3__.MemberGrade.GUEST,\n                                status: _prisma_client__WEBPACK_IMPORTED_MODULE_3__.UserStatus.ACTIVE,\n                                points: 0\n                            }\n                        });\n                    } else if (existingUser.email === process.env.ADMIN_EMAIL && existingUser.role !== _prisma_client__WEBPACK_IMPORTED_MODULE_3__.Role.ADMIN) {\n                        // 기존 사용자가 관리자 이메일이면 관리자로 업데이트\n                        await _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.update({\n                            where: {\n                                email: user.email\n                            },\n                            data: {\n                                role: _prisma_client__WEBPACK_IMPORTED_MODULE_3__.Role.ADMIN,\n                                grade: _prisma_client__WEBPACK_IMPORTED_MODULE_3__.MemberGrade.ADMIN\n                            }\n                        });\n                    }\n                    return true;\n                } catch (error) {\n                    console.error(\"Error during sign in:\", error);\n                    return false;\n                }\n            }\n            return true;\n        },\n        async session ({ session, token, user }) {\n            if (session?.user) {\n                // DB에서 사용자 정보 가져오기\n                const dbUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        email: session.user.email\n                    },\n                    select: {\n                        id: true,\n                        role: true,\n                        grade: true,\n                        status: true,\n                        points: true,\n                        phone: true\n                    }\n                });\n                if (dbUser) {\n                    session.user.id = dbUser.id;\n                    session.user.role = dbUser.role;\n                    session.user.memberGrade = dbUser.grade;\n                    session.user.isActive = dbUser.status === _prisma_client__WEBPACK_IMPORTED_MODULE_3__.UserStatus.ACTIVE;\n                    session.user.points = dbUser.points;\n                    session.user.phone = dbUser.phone;\n                }\n            }\n            return session;\n        },\n        async redirect ({ url, baseUrl }) {\n            // Allows relative callback URLs\n            if (url.startsWith(\"/\")) {\n                return `${baseUrl}${url}`;\n            } else if (new URL(url).origin === baseUrl) {\n                return url;\n            }\n            return baseUrl + \"/dashboard\";\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        signOut: \"/\",\n        error: \"/login\"\n    },\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    debug: \"development\" === \"development\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksQ0FBQ2MsSUFBSSxHQUFHYSxPQUFPYixJQUFJO29CQUMvQlcsUUFBUXpCLElBQUksQ0FBQytCLFdBQVcsR0FBR0osT0FBT1YsS0FBSztvQkFDdkNRLFFBQVF6QixJQUFJLENBQUNnQyxRQUFRLEdBQUdMLE9BQU9SLE1BQU0sS0FBS3BDLHNEQUFVQSxDQUFDcUMsTUFBTTtvQkFDM0RLLFFBQVF6QixJQUFJLENBQUNxQixNQUFNLEdBQUdNLE9BQU9OLE1BQU07b0JBQ25DSSxRQUFRekIsSUFBSSxDQUFDOEIsS0FBSyxHQUFHSCxPQUFPRyxLQUFLO2dCQUNuQztZQUNGO1lBRUEsT0FBT0w7UUFDVDtRQUNBLE1BQU1RLFVBQVMsRUFBRUMsR0FBRyxFQUFFQyxPQUFPLEVBQUU7WUFDN0IsZ0NBQWdDO1lBQ2hDLElBQUlELElBQUlFLFVBQVUsQ0FBQyxNQUFNO2dCQUN2QixPQUFPLENBQUMsRUFBRUQsUUFBUSxFQUFFRCxJQUFJLENBQUM7WUFDM0IsT0FFSyxJQUFJLElBQUlHLElBQUlILEtBQUtJLE1BQU0sS0FBS0gsU0FBUztnQkFDeEMsT0FBT0Q7WUFDVDtZQUNBLE9BQU9DLFVBQVU7UUFDbkI7SUFDRjtJQUNBSSxPQUFPO1FBQ0x4QyxRQUFRO1FBQ1J5QyxTQUFTO1FBQ1RqQixPQUFPO0lBQ1Q7SUFDQUUsU0FBUztRQUNQZ0IsVUFBVTtRQUNWQyxRQUFRLEtBQUssS0FBSyxLQUFLO0lBQ3pCO0lBQ0FDLFFBQVF2RCxRQUFRQyxHQUFHLENBQUN1RCxlQUFlO0lBQ25DQyxPQUFPekQsa0JBQXlCO0FBQ2xDLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly96ZW50cG9rZXIvLi9zcmMvbGliL2F1dGgvYXV0aC1vcHRpb25zLnRzPzhkYzMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSAnbmV4dC1hdXRoJztcbmltcG9ydCBHb29nbGVQcm92aWRlciBmcm9tICduZXh0LWF1dGgvcHJvdmlkZXJzL2dvb2dsZSc7XG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSAnQGF1dGgvcHJpc21hLWFkYXB0ZXInO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQC9saWIvcHJpc21hJztcbmltcG9ydCB7IFJvbGUsIE1lbWJlckdyYWRlLCBVc2VyU3RhdHVzIH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcbiAgYWRhcHRlcjogUHJpc21hQWRhcHRlcihwcmlzbWEpLFxuICBwcm92aWRlcnM6IFtcbiAgICBHb29nbGVQcm92aWRlcih7XG4gICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCEsXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUISxcbiAgICAgIGF1dGhvcml6YXRpb246IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgcHJvbXB0OiBcImNvbnNlbnRcIixcbiAgICAgICAgICBhY2Nlc3NfdHlwZTogXCJvZmZsaW5lXCIsXG4gICAgICAgICAgcmVzcG9uc2VfdHlwZTogXCJjb2RlXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBzaWduSW4oeyB1c2VyLCBhY2NvdW50LCBwcm9maWxlIH0pIHtcbiAgICAgIGlmIChhY2NvdW50Py5wcm92aWRlciA9PT0gJ2dvb2dsZScpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyDsgqzsmqnsnpDqsIAg7J2066+4IOyhtOyerO2VmOuKlOyngCDtmZXsnbhcbiAgICAgICAgICBjb25zdCBleGlzdGluZ1VzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiB1c2VyLmVtYWlsISB9LFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKCFleGlzdGluZ1VzZXIpIHtcbiAgICAgICAgICAgIC8vIOq0gOumrOyekCDsnbTrqZTsnbwg7ZmV7J24XG4gICAgICAgICAgICBjb25zdCBpc0FkbWluID0gdXNlci5lbWFpbCA9PT0gcHJvY2Vzcy5lbnYuQURNSU5fRU1BSUw7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOyDiCDsgqzsmqnsnpAg7IOd7ISxXG4gICAgICAgICAgICBhd2FpdCBwcmlzbWEudXNlci5jcmVhdGUoe1xuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwhLFxuICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcbiAgICAgICAgICAgICAgICBpbWFnZTogdXNlci5pbWFnZSxcbiAgICAgICAgICAgICAgICByb2xlOiBpc0FkbWluID8gUm9sZS5BRE1JTiA6IFJvbGUuVVNFUixcbiAgICAgICAgICAgICAgICBncmFkZTogaXNBZG1pbiA/IE1lbWJlckdyYWRlLkFETUlOIDogTWVtYmVyR3JhZGUuR1VFU1QsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBVc2VyU3RhdHVzLkFDVElWRSxcbiAgICAgICAgICAgICAgICBwb2ludHM6IDAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV4aXN0aW5nVXNlci5lbWFpbCA9PT0gcHJvY2Vzcy5lbnYuQURNSU5fRU1BSUwgJiYgZXhpc3RpbmdVc2VyLnJvbGUgIT09IFJvbGUuQURNSU4pIHtcbiAgICAgICAgICAgIC8vIOq4sOyhtCDsgqzsmqnsnpDqsIAg6rSA66as7J6QIOydtOuplOydvOydtOuptCDqtIDrpqzsnpDroZwg7JeF642w7J207Yq4XG4gICAgICAgICAgICBhd2FpdCBwcmlzbWEudXNlci51cGRhdGUoe1xuICAgICAgICAgICAgICB3aGVyZTogeyBlbWFpbDogdXNlci5lbWFpbCEgfSxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHJvbGU6IFJvbGUuQURNSU4sXG4gICAgICAgICAgICAgICAgZ3JhZGU6IE1lbWJlckdyYWRlLkFETUlOLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGR1cmluZyBzaWduIGluOicsIGVycm9yKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmIChzZXNzaW9uPy51c2VyKSB7XG4gICAgICAgIC8vIERC7JeQ7IScIOyCrOyaqeyekCDsoJXrs7Qg6rCA7KC47Jik6riwXG4gICAgICAgIGNvbnN0IGRiVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBzZXNzaW9uLnVzZXIuZW1haWwhIH0sXG4gICAgICAgICAgc2VsZWN0OiB7XG4gICAgICAgICAgICBpZDogdHJ1ZSxcbiAgICAgICAgICAgIHJvbGU6IHRydWUsXG4gICAgICAgICAgICBncmFkZTogdHJ1ZSxcbiAgICAgICAgICAgIHN0YXR1czogdHJ1ZSxcbiAgICAgICAgICAgIHBvaW50czogdHJ1ZSxcbiAgICAgICAgICAgIHBob25lOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkYlVzZXIpIHtcbiAgICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSBkYlVzZXIuaWQ7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSBkYlVzZXIucm9sZTtcbiAgICAgICAgICBzZXNzaW9uLnVzZXIubWVtYmVyR3JhZGUgPSBkYlVzZXIuZ3JhZGU7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLmlzQWN0aXZlID0gZGJVc2VyLnN0YXR1cyA9PT0gVXNlclN0YXR1cy5BQ1RJVkU7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnBvaW50cyA9IGRiVXNlci5wb2ludHM7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnBob25lID0gZGJVc2VyLnBob25lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgIH0sXG4gICAgYXN5bmMgcmVkaXJlY3QoeyB1cmwsIGJhc2VVcmwgfSkge1xuICAgICAgLy8gQWxsb3dzIHJlbGF0aXZlIGNhbGxiYWNrIFVSTHNcbiAgICAgIGlmICh1cmwuc3RhcnRzV2l0aChcIi9cIikpIHtcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9JHt1cmx9YDtcbiAgICAgIH1cbiAgICAgIC8vIEFsbG93cyBjYWxsYmFjayBVUkxzIG9uIHRoZSBzYW1lIG9yaWdpblxuICAgICAgZWxzZSBpZiAobmV3IFVSTCh1cmwpLm9yaWdpbiA9PT0gYmFzZVVybCkge1xuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VVcmwgKyAnL2Rhc2hib2FyZCc7XG4gICAgfVxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogJy9sb2dpbicsXG4gICAgc2lnbk91dDogJy8nLFxuICAgIGVycm9yOiAnL2xvZ2luJyxcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiAnand0JyxcbiAgICBtYXhBZ2U6IDMwICogMjQgKiA2MCAqIDYwLCAvLyAzMCBkYXlzXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXG59O1xuIl0sIm5hbWVzIjpbIkdvb2dsZVByb3ZpZGVyIiwiUHJpc21hQWRhcHRlciIsInByaXNtYSIsIlJvbGUiLCJNZW1iZXJHcmFkZSIsIlVzZXJTdGF0dXMiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsInByb2Nlc3MiLCJlbnYiLCJHT09HTEVfQ0xJRU5UX0lEIiwiY2xpZW50U2VjcmV0IiwiR09PR0xFX0NMSUVOVF9TRUNSRVQiLCJhdXRob3JpemF0aW9uIiwicGFyYW1zIiwicHJvbXB0IiwiYWNjZXNzX3R5cGUiLCJyZXNwb25zZV90eXBlIiwiY2FsbGJhY2tzIiwic2lnbkluIiwidXNlciIsImFjY291bnQiLCJwcm9maWxlIiwicHJvdmlkZXIiLCJleGlzdGluZ1VzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJlbWFpbCIsImlzQWRtaW4iLCJBRE1JTl9FTUFJTCIsImNyZWF0ZSIsImRhdGEiLCJuYW1lIiwiaW1hZ2UiLCJyb2xlIiwiQURNSU4iLCJVU0VSIiwiZ3JhZGUiLCJHVUVTVCIsInN0YXR1cyIsIkFDVElWRSIsInBvaW50cyIsInVwZGF0ZSIsImVycm9yIiwiY29uc29sZSIsInNlc3Npb24iLCJ0b2tlbiIsImRiVXNlciIsInNlbGVjdCIsImlkIiwicGhvbmUiLCJtZW1iZXJHcmFkZSIsImlzQWN0aXZlIiwicmVkaXJlY3QiLCJ1cmwiLCJiYXNlVXJsIiwic3RhcnRzV2l0aCIsIlVSTCIsIm9yaWdpbiIsInBhZ2VzIiwic2lnbk91dCIsInN0cmF0ZWd5IiwibWF4QWdlIiwic2VjcmV0IiwiTkVYVEFVVEhfU0VDUkVUIiwiZGVidWciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth/auth-options.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log:  true ? [\n        \"query\",\n        \"error\",\n        \"warn\"\n    ] : 0\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFFN0MsTUFBTUMsa0JBQWtCQztBQUlqQixNQUFNQyxTQUFTRixnQkFBZ0JFLE1BQU0sSUFBSSxJQUFJSCx3REFBWUEsQ0FBQztJQUMvREksS0FBS0MsS0FBeUIsR0FBZ0I7UUFBQztRQUFTO1FBQVM7S0FBTyxHQUFHLENBQVM7QUFDdEYsR0FBRTtBQUVGLElBQUlBLElBQXlCLEVBQWNKLGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL3plbnRwb2tlci8uL3NyYy9saWIvcHJpc21hLnRzPzAxZDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5cbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7XG4gIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBjb25zdCBwcmlzbWEgPSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID8/IG5ldyBQcmlzbWFDbGllbnQoe1xuICBsb2c6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gWydxdWVyeScsICdlcnJvcicsICd3YXJuJ10gOiBbJ2Vycm9yJ10sXG59KVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IHByaXNtYSJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJpc21hIiwibG9nIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpoints%2Ftransactions%2Froute&page=%2Fapi%2Fpoints%2Ftransactions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpoints%2Ftransactions%2Froute.ts&appDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cuser%5CDesktop%5CBusiness%5CZent_poker%5CZentpoker_code&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();