import path from "path";
import fs from "fs-extra";

async function copy() {
  const exampleRoot = path.resolve("channels"); 
  const distRoot = path.resolve("dist");

  // 1. 确保 dist 目录存在
  await fs.ensureDir(distRoot);

  const exampleFolders = await fs.readdir(exampleRoot);
  
  // 过滤出真正包含 public 的文件夹
  const validChannels = [];

  // 2. 拷贝各频道产物
  await Promise.all(exampleFolders.map(async (folder) => {
    const copyFrom = path.join(exampleRoot, folder, "public");
    const copyTo = path.join(distRoot, folder);
    
    if (fs.existsSync(copyFrom)) {
        await fs.copy(copyFrom, copyTo);
        validChannels.push(folder); // 记录有效频道用于生成主页链接
    }
  }));

  // 3. 核心：自动生成主目录 index.html (导航中心)
  const links = validChannels
    .map(ch => `<li><a href="./${ch}/" style="text-transform: capitalize;">${ch} Channel</a></li>`)
    .join("");

  const indexHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSS 情报矩阵 - 控制中心</title>
    <style>
        body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; line-height: 1.6; background: #1a1a1a; color: #eee; }
        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        ul { list-style: none; padding: 0; }
        li { margin: 15px 0; background: #252525; padding: 10px; border-radius: 5px; }
        a { color: #007bff; text-decoration: none; font-weight: bold; font-size: 1.2rem; }
        a:hover { color: #0056b3; }
    </style>
</head>
<body>
    <h1>🛰️ RSS 情报矩阵</h1>
    <p>多维度信息巡检系统：</p>
    <ul>${links}</ul>
</body>
</html>`;

  await fs.writeFile(path.join(distRoot, "index.html"), indexHtml);

  // 4. 写入 CNAME
  await fs.writeFile(path.join(distRoot, "CNAME"), "rss3.duoweiti.eu.org");
  
  console.log("Build Complete: Channels copied, index.html & CNAME generated.");
} 

copy().catch(err => {
    console.error(err);
    process.exit(1);
});
