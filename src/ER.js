class Entity{
    constructor(name, attributes, is_weak){
        this.name = name;
        this.attributes = attributes;
        this.is_weak = is_weak;
    }

    addAttribute(attribute){
        this.attributes.push(attribute);
    }
}

class Attribute{
    constructor(name,  data_type, is_key=False){
        this.name = name;
        this.data_type = data_type;
        this.is_key = is_key;
     }
}

class Relation{
    constructor(name, e1,e2,c1,c2, is_weak){
        this.name = name;
        this.entities = [e1, e2];
        this.cardinality = [c1,c2];
        this.is_weak = is_weak;
    }

    addAttribute(attribute){
        this.attributes.push(attribute);
    }
}

class ER{
    constructor(){
        this.entities = [];
        this.relations = [];
    }

    addEntity(entity){
        this.entities.push(entity);
    }

    addRelation(relation){
        this.relations.push(relation);
    }
}



// frontend json -> parsed json -> ER class -> SQL

// function convert_ER_to_json(er){

// }

function convert_json_to_ER(json){

}

function strong_entity_2sql(entity){
    // start code
    var sql = "CREATE TABLE " + entity.name + " (";
    for (var i = 0; i < entity.attributes.length; i++){
        var attribute = entity.attributes[i];
        sql += attribute.name + " " + attribute.data_type;
        if (attribute.is_key){
            sql += " PRIMARY KEY";
        }
        if (i != entity.attributes.length - 1){
            sql += ", ";
        }
    }
    sql += ");\n";
    return sql;
    // end code
}


function convert_ER_to_SQL(er){
    // for each entity, create a table
    // for each relation, create a table
    // for each attribute, create a column
    // for each relation, create a foreign key
    // for each weak entity, create a foreign key

    // start code
    var sql = "";
    for (var i = 0; i < er.entities.length; i++){
        var entity = er.entities[i];
        sql += "CREATE TABLE " + entity.name + " (";
        for (var j = 0; j < entity.attributes.length; j++){
            var attribute = entity.attributes[j];
            sql += attribute.name + " " + attribute.data_type;
            if (attribute.is_key){
                sql += " PRIMARY KEY";
            }
            if (j != entity.attributes.length - 1){
                sql += ", ";
            }
        }
        sql += ");\n";
    }

    // deal with weak entities
    for (var i = 0; i < er.entities.length; i++){
        var entity = er.entities[i];
        if (entity.is_weak){
            sql += "ALTER TABLE " + entity.name + " ADD FOREIGN KEY (";
            var relation = er.relations[i];
            var weak_entity = relation.entities[0];
            sql += weak_entity.name + ") REFERENCES " + weak_entity.name + ";\n";
        }
    }

    for (var i = 0; i < er.relations.length; i++){
        var relation = er.relations[i];
        sql += "CREATE TABLE " + relation.name + " (";
        for (var j = 0; j < relation.entities.length; j++){
            var entity = relation.entities[j];
            sql += entity.name + " " + entity.data_type;
            if (j != relation.entities.length - 1){
                sql += ", ";
            }
        }
        sql += ");\n";
    }

    return sql;
    // end code
}

