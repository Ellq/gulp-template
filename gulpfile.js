const gulp = require("gulp")
const rename = require("gulp-rename")

const pug = require("gulp-pug")
const plumber = require("gulp-plumber")
const pugLinter = require("gulp-pug-linter")
const htmlValidator = require("gulp-w3c-html-validator")
const bemValidator = require("gulp-html-bem-validator")

const sass = require("gulp-sass")
const autoprefixer = require("autoprefixer")
const sourcemap = require("gulp-sourcemaps")
const cleanCSS = require("gulp-clean-css")
const postcss = require("gulp-postcss")

const imagemin = require("gulp-imagemin")
const webp = require("gulp-webp")
const svgstore = require("gulp-svgstore")

const sync = require("browser-sync").create()
const del = require("del")

const webpack = require('webpack-stream')
const eslint = require("gulp-eslint")

// HTML

const pug2html = () => {
  return gulp.src("src/pages/*.pug")
    .pipe(plumber())
    .pipe(pugLinter({ reporter: "default" }))
    .pipe(pug())
    .pipe(htmlValidator())
    .pipe(bemValidator())
    .pipe(gulp.dest("build"))
}

exports.pug2html = pug2html

// Styles

const styles = () => {
  return gulp.src("src/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(cleanCSS({
      debug: true,
      compatibility: "*"
    }, details => {
      console.log(`${details.name}: Original size:${details.stats.originalSize} - Minified size: ${details.stats.minifiedSize}`)
    }))
    .pipe(sourcemap.write())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("build/css"))
}

exports.styles = styles

// Scripts

const scripts = () => {
  return gulp.src("src/js/main.js")
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(sourcemap.init())
    .pipe(webpack({
      mode: process.env.NODE_ENV,
      output: {
        filename: '[name].min.js',
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      }
    }))
    .pipe(sourcemap.write())
    .pipe(gulp.dest("build/js"))
  // return cb();
}

exports.scripts = scripts

// Copy

const copy = () => {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/*.ico"
  ], {
    base: "src"
  })
    .pipe(gulp.dest("build"))
}

exports.copy = copy

// Images

const imageMinify = () => {
  return gulp.src("src/img/**/*.{gif,png,jpg,svg}")
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.imageMinify = imageMinify

const towebp = () => {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"))
}

exports.towebp = towebp

// Sprite

const sprite = () => {
  return gulp.src("src/img/sprite/*.svg")
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite

// Clean

const clean = (cb) => {
  return del("build").then(() => {
    cb()
  })
}

exports.clean = clean

// Refresh

const refresh = (cb) => {
  sync.reload()
  cb()
}

exports.refresh = refresh

// Server

const server = (cb) => {
  sync.init({
    ui: false,
    notify: false,
    open: true,
    cors: true,
    server: {
      baseDir: "build"
    }
  })

  gulp.watch("src/img/**/*.{jpg,png,svg,gif}", gulp.series(imageMinify, towebp, refresh));
  gulp.watch("src/pages/**/*.pug", gulp.series(pug2html, refresh));
  gulp.watch("src/scss/**/*.scss", gulp.series(styles, refresh));
  gulp.watch("src/js/**/*.js", gulp.series(scripts, refresh));
  gulp.watch("src/img/sprite/*.svg", gulp.series(sprite, refresh));
  gulp.watch("src/fonts/**/*", gulp.series(copy, refresh));

  return cb()
}

exports.server = server

const dev = gulp.parallel(
  pug2html,
  styles,
  scripts,
  copy,
  imageMinify,
  sprite,
  towebp
)

const build = gulp.series(clean, dev)

exports.start = gulp.series(build, server)
exports.build = gulp.series(build)
