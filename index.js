/*
    1. buat API menggunakan express js;
    2. buat object lagu dengan atribut dengan atribut : id, judul_lagu, artis, favorite
    2. Buat endpoint get list data lagu
    3. buat endpoint tambah lagu, tambah lagu favorit.
    4. buat endpoint get list lagu favorit saja.
*/
/*
    - update table lagu dengan menambahkan field 
    - is_favorite smallint
    - updated_at datetime
    - buat satu fungsi untuk menmbahkan lagu is_favorite
    - buat satu fungsi untuk menampilkan lagu is_favorite saja
    - ketika memperbarui judul lagu isi updated_at akan selalu di perbarui
    - buat satu fungsi dinamis bisa memfilter berdasarkan judul/artis/is_favorite
    - buat satu fungsi dinamis bisa mengurutkan data berdasarkan semua field yang tersedia di tabel lagu
*/
import mysqlPromise from "mysql2/promise.js";

let poolDb = mysqlPromise.createPool({
    host: "127.0.0.1",
    port: '3306',
    user: "root",
    password: "123",
    database: "user_app",
    socketPath: "/var/run/mysqld/mysqld.sock"
});

import express from "express";
import { nanoid } from "nanoid";


class lagu {
    constructor(id, judul_lagu, artis, is_favorite) {
        this.id = id;
        this.judul_lagu = judul_lagu;
        this.artis = artis;
        this.is_favorite = is_favorite;
    } 
}

class Task {
    constructor (id, name, completed) {
        this.id = id, 
        this.name = name
        this.completed = completed || false
    }
}

let tasks = [];

const app = express();
const port = 8080;
const host = "localhost";

app.use(express.json());

app.get("/tasks", (req, res) => {
    res.json(tasks);
});


app.get("/tasks/:id", (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({message:"data not found!!"})

    res.json(task);
})

app.post('/tasks', (req, res) => {
    const task = new Task(nanoid(6), req.body.name, req.body.completed);
    
    tasks.push(task);
    res.json(task)
});

app.put('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id)
    if (!task) return res.status(404).json({message:"data not found!!"})
    
    task.name = req.body.name;
    task.completed = req.body.completed;
    res.json(task);
});

app.delete('/tasks/:id',(req, res) => {
    const index = tasks.findIndex(t=> t.id === req.params.id);
    if(!task) return res.status(404).json({message:"data not found!"})

    const task = tasks.splice(index, 1);
    res.json(task);
});


app.get("/songs", async (req, res) => {
    const sql = 'select * from Lagu';
    try {
        const [result, field] = await poolDb.query(sql)        
        res.status(200).json(result);        
    } catch (error) {
        throw error;
    }
})

// tambahLagu("Bang ocid", "wakwaw");

app.post("/songs", async (req, res) => {
    const created_at = new Date();
    const sql = "insert into Lagu (judul, artis, is_favorite, created_at) values (?, ?, ?, ?)"
    const value =  [req.body.judul, req.body.artis, req.body.is_favorite, created_at, req.body.is_favorite];
    try {
        const [result, field] = await poolDb.query(sql, value);
        res.status(200).json({message: `Data berhasil ditambahkan: ${value}`});       
    } catch (error) {
        throw error;
    }
});



app.put("/songs/:id", async (req, res) => {
    const updated_at = new Date();
    const sql = "UPDATE `Lagu` SET `judul` = ?, `artis` = ?, `updated_at` = ?, `is_favorite` = ? WHERE `Lagu`.`id` = ?;";
    const value = [req.body.judul, req.body.artis, updated_at, req.body.is_favorite, req.params.id];
    try {
        const [result, field] = await poolDb.query(sql, value);
        res.status(200).json({message: `Data berhasil diubah: ${value}`});
        if(result.affectedRows === 0) {
            res.send(`Data tidak berubah`)
        }
    } catch (error) {
        throw error;
    }  
})

app.delete("/songs/:id", async (req, res) => {
    const sql = "delete from Lagu where id = ?"
    const value = [req.params.id];
    try {
        const [result, field] = await poolDb.query(sql, value);
        if (result.affectedRows === 0) {
            res.status(404).json({message:`Data not found with id: ${req.params.id}`})
        } else {
        res.status(200).json({message: `Data Deleted with id: ${req.params.id}`});
        }
    } catch (error) {
        throw error;
    }
})

app.listen(port,host,()=>{
    console.log(`server berjalan di http://${host}:${port}`);
});

const tambahLagu = async (judul_lagu, artis, is_favorite = 0) => {
    const created_at = new Date();
    
    const sql = 'insert into Lagu (judul, artis, created_at, is_favorite) values (?, ?, ?, ?)';
    const value = [judul_lagu, artis, created_at, is_favorite];

    const [result, field] = await poolDb.query(sql, value);

    console.log(`data lagu berhasil ditambahkan dengan id ${result.insertId}`);

}

const hapusLagu = async (id) => {
    const sql = `delete from Lagu where id = ${id}`;
    const [result, field] = await poolDb.query(sql);
    console.log(`Data lagu berhasil dihapus dengan id: ${id}`);
}

const listLagu = async () => {
    const sql = 'select * from Lagu'
    const [result, field] = await poolDb.query(sql);
    console.log(result);
}

const updateLagu = async (id, judul_lagu) => {
    const updated_at = new Date();
    const sql = 'update Lagu set judul = ?, updated_at = ? where id = ?';
    const value = [judul_lagu, updated_at, id];
    try {
        const [result, field] = await poolDb.query(sql, value);
        console.log(`Data berhasil diupdate : ${value}`);   
    } catch (error) {
        console.log(error);
    }
}

const tambahLaguFavorite = async(id) => {
    const sql = 'update Lagu set is_favorite = 1 where id = ?';
    const value = [id]
    try {
        const [result, field] = await poolDb.query(sql, value);
        console.log(`Lagu dengan id: ${id} berhasil ditambahkan ke favorite`);
    } catch (error) {
        console.log(error);
    }
}

const hapusLaguDariFavorite = async (id) => {
    const sql = `update Lagu set is_favorite = 0 where id = ${id}`
    try {
        const [result, field] = await poolDb.query(sql);
        console.log(`lagu dengan id: ${id} berhasil dihapus dari favorite`);
    } catch (error) {
        console.log(error)
    }
}

const lihatLaguFavorite = async () => {
    const sql = 'select * from Lagu where is_favorite = 1'
    try {
        const [result, field] = await poolDb.query(sql)
        console.log(result);
    } catch (error) {
        console.log(error)
    }
}

const lihatLaguBukanFavorite = async () => {
    const sql = 'select * from Lagu where is_favorite = 0';
    try {
        const [result, field] = await poolDb.query(sql);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

const urutkanLagu = async (option = "judul", order = "asc") => {
    const sql = `select * from Lagu order by ${option} ${order}`;
    try {
        const [result, field] = await poolDb.query(sql);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}


const filterLagu = async (option = "judul", value = "insomnia") => {
    const sql = `select * from Lagu where ${option} = '${value}'`;
        try {
            const [result, field] = await poolDb.query(sql);
            console.log(result);
        } catch (error) {
            console.log(error);
        }
}


