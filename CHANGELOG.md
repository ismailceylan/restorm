# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.10.0](https://github.com/ismailceylan/restorm/compare/v1.9.0...v1.10.0) (2024-11-14)


### Features

* **query-builder:** add mustache syntax support for dynamic url generation ([cb2fc3f](https://github.com/ismailceylan/restorm/commit/cb2fc3f306dcb30d163a7250f4185ee751d741f6))


### Bug Fixes

* **model:** accept strings as model ([3c45b0a](https://github.com/ismailceylan/restorm/commit/3c45b0a60ab9b3e2ea68e5733edb4638a2a1d2f8))
* **query-builder:** catch client side bad requests ([eadccbb](https://github.com/ismailceylan/restorm/commit/eadccbb91779c7f7bf5987135bfde7f54b23b91c))
* **query-builder:** trailing slash problem ([8a76686](https://github.com/ismailceylan/restorm/commit/8a76686d4d17c437d92a8c55811028f441f2a8d6))

## [1.9.0](https://github.com/ismailceylan/restorm/compare/v1.8.0...v1.9.0) (2024-06-17)


### Features

* **collection:** add diff method ([3e62950](https://github.com/ismailceylan/restorm/commit/3e6295064794ea6d15e919af0bb7f8b11cc98021))
* **query-builder:** add callback support to the from method ([e6096c7](https://github.com/ismailceylan/restorm/commit/e6096c71ffd1fcf58479e472beababccd1fa96b4))


### Bug Fixes

* **collection:** compare problem ([8b3d646](https://github.com/ismailceylan/restorm/commit/8b3d646864d0d12ff164b4386b26582ec4de1861))
* **collection:** fix contains bugs ([fbcbb65](https://github.com/ismailceylan/restorm/commit/fbcbb65dc40cba0cf2f3b7e5304a4e3aa09f7e67))

## [1.8.0](https://github.com/ismailceylan/restorm/compare/v1.7.0...v1.8.0) (2024-06-13)


### Features

* **collection:** add contains method ([e5f69da](https://github.com/ismailceylan/restorm/commit/e5f69dab34788ebd9aea95f270ae9ef43126d508))
* **collection:** proxify array returner methods to return collection ([fe035df](https://github.com/ismailceylan/restorm/commit/fe035dfe949be28a23739006e3e80632b886ce12))

## [1.7.0](https://github.com/ismailceylan/restorm/compare/v1.6.0...v1.7.0) (2024-05-21)


### Features

* add whereBetween method ([b57610f](https://github.com/ismailceylan/restorm/commit/b57610fbbdf58407cc064800e3269d504dcf1858))
* add whereIn method ([be5c4bc](https://github.com/ismailceylan/restorm/commit/be5c4bc6e5ff848981f72b5fa7d63541c835f8e9))
* add whereNotBetween method ([2ee229a](https://github.com/ismailceylan/restorm/commit/2ee229a0447df3a27b2211d35d468f6b2427a4a4))
* add whereNotIn method ([98f9845](https://github.com/ismailceylan/restorm/commit/98f9845aa7b7e8df9bc46da39dd5236cc397fca2))
* add whereNotNull method ([becfcc3](https://github.com/ismailceylan/restorm/commit/becfcc31f349b22a79965981b29c49f1badda09a))
* add whereNull method ([b181293](https://github.com/ismailceylan/restorm/commit/b18129388cfbe2a92d133a474e6a08ac86aae96d))
* **operator:** add "notin" support ([104fbcf](https://github.com/ismailceylan/restorm/commit/104fbcfc799e5a30728e70d4cc169b0daaeb3112))

## [1.6.0](https://github.com/ismailceylan/restorm/compare/v1.5.0...v1.6.0) (2024-05-20)


### Features

* add post method to send post requests ([f8a16ee](https://github.com/ismailceylan/restorm/commit/f8a16ee9353a1094602df0501d13b13ac7e3f5e5))
* **query-builder:** support for other known comp. operators other than equality ([71c851c](https://github.com/ismailceylan/restorm/commit/71c851c7e19218c16056462991517f8d54cb6a78))


### Bug Fixes

* **model:** eliminate runtime error in case of `model instanceof undefined` ([862a92c](https://github.com/ismailceylan/restorm/commit/862a92c342a18051d9cd232ab83abd4f8e6e2052))

## [1.5.0](https://github.com/ismailceylan/restorm/compare/v1.4.0...v1.5.0) (2024-05-14)


### Features

* add off method to remove events ([b923da3](https://github.com/ismailceylan/restorm/commit/b923da333cc4de364fddde520a69b0415de099e6))


### Bug Fixes

* **model:** use common query builder on model instances ([755f8f1](https://github.com/ismailceylan/restorm/commit/755f8f1b8eea5df1c3ac05bf8231164fba4338c7))

## [1.4.0](https://github.com/ismailceylan/restorm/compare/v1.3.1...v1.4.0) (2024-05-05)


### Features

* add dynamic resource building ([ac3be37](https://github.com/ismailceylan/restorm/commit/ac3be3760d416aaff5e8d87a293eeef7c915613c))


### Bug Fixes

* **model:** add hasInstance method to remove maximum call stack exceeded errors ([b0431cd](https://github.com/ismailceylan/restorm/commit/b0431cde61c525097832e23f522d4f98a73b8895))
* **query-builder:** temp resource occupation caused by the find method ([6bff726](https://github.com/ismailceylan/restorm/commit/6bff72663a0e176fd5e14958aa77ea9b2785c497))

### [1.3.1](https://github.com/ismailceylan/restorm/compare/v1.3.0...v1.3.1) (2024-03-29)


### Bug Fixes

* **model:** add missed lifecycle hook names ([6bdde87](https://github.com/ismailceylan/restorm/commit/6bdde87f17a14ebb7217d8aac5c2379dae8065e3))
* **model:** resource name conflict ([3aa16e9](https://github.com/ismailceylan/restorm/commit/3aa16e968c1e5c4f1b002930680c1ee6e69d8e7d))
* **paginator:** add a lock mechanism to prevent pinging during ongoing requests ([00c68d6](https://github.com/ismailceylan/restorm/commit/00c68d659a66c37cd55ceac4d424fbe34c06dc88))

## [1.3.0](https://github.com/ismailceylan/restorm/compare/v1.2.0...v1.3.0) (2024-03-08)


### Features

* **paginator:** support pagination metadata ([503ee54](https://github.com/ismailceylan/restorm/commit/503ee54dbb835f372b829c1f422ecd6681fa79ba))
* **query-builder:** add reset method ([4583b2b](https://github.com/ismailceylan/restorm/commit/4583b2b1bcc85c7f536b436739b320d954609958))


### Bug Fixes

* **collection:** abandon private field usage ([2cda5f2](https://github.com/ismailceylan/restorm/commit/2cda5f25bab04a05ff5e6e8d4fe7595494ded80f))
* **collection:** handle toStringTag requests by  proxy ([29a2797](https://github.com/ismailceylan/restorm/commit/29a2797ada210dbfce695554b08a9899ab62a5ac))
* **paginator:** clear overlapping event listeners of ping method ([b0694ac](https://github.com/ismailceylan/restorm/commit/b0694aca08865f5cb0660b15e736f848a23688c4))

## [1.2.0](https://github.com/ismailceylan/restorm/compare/v1.1.0...v1.2.0) (2024-02-24)


### Features

* add once mode for event listeners ([91ad6de](https://github.com/ismailceylan/restorm/commit/91ad6de531ad9fa673c1d5057f92080c05ac283c))
* add patch method ([0e00d57](https://github.com/ismailceylan/restorm/commit/0e00d57f9f6a2acd209661991e49935dd199a603))
* add support statically put ([4aae64f](https://github.com/ismailceylan/restorm/commit/4aae64ff5a6baeda22a6006adac35e7c7e2da6a6))


### Bug Fixes

* **client:** use primary key pointed by model ([0841fcb](https://github.com/ismailceylan/restorm/commit/0841fcbad41ac8669b670caba60ab380cd437fcd))

## 1.1.0 (2024-02-16)


### Features

* add array methods ([520cae4](https://github.com/ismailceylan/restorm/commit/520cae4721c9d336182208b1d969923867b68526))
* add cast mechanism ([e4816f7](https://github.com/ismailceylan/restorm/commit/e4816f7afc444be37d390583cabe34aef065d67e))
* add last method ([1b9f83b](https://github.com/ismailceylan/restorm/commit/1b9f83b4b99b8f0dae4f5f44212ed38294ccd9bb))
* add pluck method ([259669c](https://github.com/ismailceylan/restorm/commit/259669c1b8bab20e8c3af48fb5aa43bca7e91678))
* add scope method ([5164b1b](https://github.com/ismailceylan/restorm/commit/5164b1b3d0103d78fbc6009d5ef5b0926c083680))
* add size getter ([61db8d5](https://github.com/ismailceylan/restorm/commit/61db8d5da73161157bb5dff8bf65ee70ed6f6543))
* cancel query ([691cdb3](https://github.com/ismailceylan/restorm/commit/691cdb31115ef077008a7688ae631ecfea49894f))
* **collection:** add sort method ([b73ab47](https://github.com/ismailceylan/restorm/commit/b73ab47f6e2f8e7d92eefd25d85f31f3be1b589c))
* event handling ([45bd537](https://github.com/ismailceylan/restorm/commit/45bd5373ea8c183863b5c2beb1549a302a4669c2))
* **model:** add has method ([abdd4cd](https://github.com/ismailceylan/restorm/commit/abdd4cdc7d2a55aeb7bc1bd8f8dbe860a74e8664))
* paginate ([6666138](https://github.com/ismailceylan/restorm/commit/6666138903a9de42fc0c07069398861243555460))
* put method support ([eee495d](https://github.com/ismailceylan/restorm/commit/eee495d56954af97d112fdc7ec220517c3585018))


### Bug Fixes

* **collection:** symbol in isNaN ([d21a4e3](https://github.com/ismailceylan/restorm/commit/d21a4e3ac98b549f5f4174978b40890260b79433))
* **model:** satisfy vue reactivity system ([825cba3](https://github.com/ismailceylan/restorm/commit/825cba3240394d9614954639b3e1aa47cf6c6e1b))
* **QueryBuilder:** singular variable name ([cdd42c7](https://github.com/ismailceylan/restorm/commit/cdd42c74e473f063141411862aeabf06224e4662))
