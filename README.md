# template-xlsx CLI

CLI tool to merge CSV data with an Excel template (.xlsx) using a schema that maps CSV columns to worksheet cells.

## 実行方法

- Node.js で実行: `node main.js --csv <data.csv> --template <template.xlsx> --schema <schema.json> [options]`
- 同梱の単一実行ファイル: `template-xlsx.exe --help`

## 必須引数
- `--csv <file>`: スキーマに定義されたカラムを全て含むCSVデータ。
- `--template <file>`: テンプレートとなる .xlsx ファイル。
- `--schema <file>`: `cellField` マッピングと `metaData` を含むJSONスキーマ。

## オプション
- `--output-prefix <key>`: 出力ファイル名に使うCSVカラム。既定: `path`。
- `--output-dir <dir>`: 生成した `.xlsx` の出力ディレクトリ。既定: カレントディレクトリ。
- `--index <number>`: テンプレートで使用するシートのインデックス。スキーマ `metaData.sheetIndex` を上書き。既定: `0`。
- `--verbose`: 詳細ログを有効化。
- `--help`, `-h`: 使い方を表示。

## スキーマ例
`schema.json` の例:
```json
{
  "cellField": {
    "month": "C3",
    "day": "E3",
    "name": "J3"
  },
  "metaData": {
    "sheetIndex": 0
  }
}
```
