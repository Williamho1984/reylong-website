export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }

  if (quoted) throw new Error('CSV has an unterminated quoted field')
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export function assertConsistentColumnCount(rows, source = 'CSV') {
  if (!rows.length) throw new Error(`${source}: CSV is empty`)
  const expected = rows[0].length
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length !== expected) {
      throw new Error(`${source}: row ${i + 1} has ${rows[i].length} columns; expected ${expected}`)
    }
  }
  return rows
}

export function quoteCsv(value) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
