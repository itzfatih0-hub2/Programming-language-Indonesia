program         ::= statement*

statement       ::= variable
                  | print
                  | if
                  | while
                  | for
                  | function
                  | return
                  | class
                  | import
                  | expressionStatement

variable        ::= ("buat" | "bikin") IDENTIFIER "=" expression
examples = 
buat nama = "Fatih"
bikin umur = 13

if              ::= ("jika" | "kalo")
                    expression
                    ("maka" | "ya")?
                    block
                    (("lain" | "else") block)?
examples =
jika umur >= 13 {
    tampilin("Boleh")
} lain {
    tampilin("Belum")
}

while           ::= ("selama" | "selagi")
                    expression
                    block
examples =
selama x < 10 {
    x = x + 1
}

for             ::= ("untuk")
                    IDENTIFIER
                    ("dari")
                    expression
                    ("sampai" | "sampe")
                    expression
                    (("langkah") expression)?
                    block
examples =
untuk i dari 1 sampai 10 {
    tampilin(i)
}
with step =
untuk i dari 1 sampai 10 langkah 2 {
    tampilin(i)
}

function        ::= ("fungsi" | "bikinfungsi")
                    IDENTIFIER
                    "(" parameters? ")"
                    block
parameters      ::= IDENTIFIER ("," IDENTIFIER)*
examples =
fungsi attack() {
    tampilin("SERANG!")
}
or =
fungsi tambah(a, b) {
    kembali a + b
}

return          ::= ("kembali" | "balikin") expression?
examples =
fungsi tambah(a, b) {
    kembali a + b
}

import          ::= ("pakai" | "ambil") STRING
examples =
pakai "matematika"

class           ::= "kelas"
                    IDENTIFIER
                    "{"
                    classMember*
                    "}"
classMember     ::= function
                  | variable
examples =
kelas Player {

    buat nama = "you"

    fungsi attack() {
        tampilin("Attack!")
    }

}

expression      ::= assignment

assignment      ::= logicalOr
                    ("=" assignment)?

logicalOr       ::= logicalAnd
                    (("atau" | "||") logicalAnd)*

logicalAnd      ::= equality
                    (("dan" | "&&") equality)*

equality        ::= comparison
                    (("==" | "!=") comparison)*

comparison      ::= term
                    ((">" | "<" | ">=" | "<=") term)*

term            ::= factor
                    (("+" | "-") factor)*

factor          ::= unary
                    (("*" | "/" | "%") unary)*

unary           ::= ("tidak" | "!") unary
                  | "-" unary
                  | call

call            ::= primary
                    (
                        "(" arguments? ")"
                      | "." IDENTIFIER
                      | "[" expression "]"
                    )*
arguments       ::= expression ("," expression)*
examples =
attack()
tambah(10, 20)

player.nama
player.attack()

array[0]

primary         ::= NUMBER
                  | STRING
                  | BOOLEAN
                  | NULL
                  | IDENTIFIER
                  | "(" expression ")"
                  | array
                  | object

array           ::= "[" elements? "]"

elements        ::= expression ("," expression)*

examples =
buat angka = [1, 2, 3, 4]

object          ::= "{" properties? "}"

properties      ::= property ("," property)*

property        ::= (IDENTIFIER | STRING)
                    ":"
                    expression
examples = 
buat player = {
    nama: "Fatih",
    level: 10
}

block           ::= "{"
                    statement*
                    "}"
so :
fungsi attack() {
    tampilin("SERANG!")

    buat damage = 100

    jika damage > 50 {
        tampilin("KUAT!")
    }
}
it can restart

--------------------------------------
| Keyword                 | meaning  |
| ----------------------- | -------- |
| `buat`, `bikin`         | variable |
| `tampilkan`, `tampilin` | print    |
| `jika`, `kalo`          | if       |
| `maka`, `ya`            | then     |
| `lain`, `else`          | else     |
| `selesai`, `udah`       | end      |
| `fungsi`, `bikinfungsi` | function |
| `kembali`, `balikin`    | return   |
| `untuk`                 | for      |
| `dari`                  | from     |
| `sampai`, `sampe`       | to       |
| `langkah`               | step     |
| `lakukan`               | do       |
| `selama`, `selagi`      | while    |
| `tunggu`                | wait     |
| `kelas`                 | class    |
| `pakai`, `ambil`        | import   |
| `dan`                   | AND      |
| `atau`                  | OR       |
| `tidak`                 | NOT      |
| `benar`                 | true     |
| `salah`                 | false    |
| `kosong`                | null     |
--------------------------------------
