const path = require("path");
const fs = require("fs");
const { mkdir } = require("fs/promises");
const dirProject = path.join(__dirname, "project-dist");
const dirOldAssets = path.join(__dirname, "assets");
const dirNewAssets = path.join(dirProject, "assets");
const dirOldStyle = path.join(__dirname, "styles");
const newStyle = path.join(dirProject, "style.css");

const copyFileFromFolder = (oldDir, newDir) => {
  mkdir(newDir, { recursive: true }).then(() => {
    // опция `withFileTypes` установлена в `true`, что позволяет получить информацию о типе каждого файла или папки.
    fs.readdir(oldDir, { withFileTypes: true }, (err, files) => {
      for (let file of files) {
        // создаем новую директорию и называем ее
        let name = path.join(oldDir, file.name);
        let nameCopy = path.join(newDir, file.name);
        if (file.isDirectory()) {
          copyFileFromFolder(name, nameCopy);
          console.log("create folder " + file.name);
        } else {
          // Для копирования файлов используется методы `createReadStream` и `createWriteStream` из модуля `fs`
          fs.createReadStream(name).pipe(fs.createWriteStream(nameCopy));
        }
      }
    });
  });
};

// создаем новый файл стилей путем обьединения всех файлов стилей из dirOldStyle
const enjoyStyle = () => {
  const writeStream = fs.createWriteStream(newStyle);
  fs.readdir(dirOldStyle, { withFileTypes: true }, (err, files) => {
    console.log("merge style");
    for (let file of files) {
      if (file.isFile() && path.extname(file.name) === ".css") {
        fs.createReadStream(path.join(dirOldStyle, file.name), "utf8").on(
          "data",
          (data) => {
            writeStream.write(data);
          }
        );
      }
    }
  });
};

//  созданем файл "index.html" на основе шаблона, указанного в "template"
function htmlBuild(template, index) {
  let html = "";
  let templateStream = fs.createReadStream(template, { encoding: "utf8" });
  templateStream.on("data", (data) => {
    html += data.toString();
  });
  console.log("create index.html");
  templateStream.on("end", () => {
    replaceContent(html, index);
  });
}

// Эта функция заменяет содержимое в HTML-файле, используя шаблоны из компонентов. Она принимает два параметра: HTML-код и путь к файлу, в который нужно записать измененный HTML.
function replaceContent(html, target) {
  const workDir = path.join(__dirname, "components");
  let newHtml = html;
  // Регулярное выражение `regexp` ищет в HTML-коде шаблоны, заключенные в двойные фигурные скобки.
  const regexp = /{{.*}}/gm;
  let match;
  // Цикл `while` выполняется до тех пор, пока находятся шаблоны.
  while ((match = regexp.exec(html))) {
    let income = match[0];
    // Переменная `matchName` содержит имя файла компонента, которое получается из найденного шаблона.
    let matchName = match[0].replace("{{", "").replace("}}", ".html");
    let getTemplateContent = fs.createReadStream(
      path.join(workDir, matchName),
      { encoding: "utf8" }
    );
    let templateContent = "";
    // Переменная `getTemplateContent` создает поток для чтения содержимого файла компонента.
    getTemplateContent.on("data", (data) => {
      templateContent = data.toString();
    });
    // Обработчик события `'data'` собирает содержимое файла компонента в переменную `templateContent`.
    // Обработчик события `'end'` заменяет найденный шаблон в переменной `newHtml` на содержимое файла компонента и записывает измененный HTML-код в файл, указанный в параметре `target`.
    getTemplateContent.on("end", () => {
      newHtml = newHtml.replace(income, templateContent);
      let writeIndex = fs.createWriteStream(target, { encoding: "utf8" });
      writeIndex.write(newHtml);
    });
  }
}

fs.rm(dirProject, { recursive: true, force: true }, () => {
  console.log("rebuild project");
  mkdir(dirProject, { recursive: true }).then(() => {
    console.log("create folder project-dist");
    mkdir(dirNewAssets, { recursive: true }).then(() => {
      console.log("create folder asset");
      copyFileFromFolder(dirOldAssets, dirNewAssets);
      enjoyStyle();
      htmlBuild(
        path.join(__dirname, "template.html"),
        path.join(dirProject, "index.html")
      );
    });
  });
});
