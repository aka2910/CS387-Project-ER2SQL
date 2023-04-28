class Table{
    constructor(name){
        this.name = name;
        this.attributes = [];
        this.primary_keys = [];
        this.foreign_keys = [];
    }
    addAttribute(attribute){
        this.attributes.push(attribute);
    }
    addPrimaryKey(key){
        this.primary_keys.push(key);
    }
    addForeignKey(key){
        this.foreign_keys.push(key);
    }
    print_sql(){
        var sql = "CREATE TABLE " + this.name + " (\n";
        for (var i = 0; i < this.attributes.length; i++){
            var attribute = this.attributes[i];
            sql += attribute.name + " " + attribute.data_type;
            if (!attribute.is_null){
                sql += " NOT NULL";
            }
            sql += ",\n";
        }
        sql+= "PRIMARY KEY (";
        for (var i = 0; i < this.primary_keys.length; i++){
            var key = this.primary_keys[i];
            sql += key;
            if (i != this.primary_keys.length - 1){
                sql += ", ";
            }
        }
        sql += "),\n";
        for (var i = 0; i < this.foreign_keys.length; i++){
            var key = this.foreign_keys[i];
            sql += "FOREIGN KEY ("
            for (var j = 0; j < key.keys.length; j++){
                var key_name = key.keys[j];
                sql += key_name;
                if (j != key.keys.length - 1){
                    sql += ", ";
                }
            }
            sql += ") REFERENCES " + key.reference + ",\n";
        }
        sql = sql.slice(0, -2);
        sql += "\n);\n";
        console.log(sql);
        return sql;
    }
}

class Foreign_Key{
    constructor(keys, reference){
        this.keys = keys;
        this.reference = reference;
    }
}

module.exports = {Table, Foreign_Key};

