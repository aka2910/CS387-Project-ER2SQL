

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
    constructor(name,  data_type, is_key=false, is_null=true){
        this.name = name;
        this.data_type = data_type;
        this.is_key = is_key;
        this.is_null = is_null;
     }
}

class Relation{
    constructor(name, e1,e2,c1,c2,p1,p2, is_weak, attribute){
        this.name = name;
        this.e1 = e1 
        this.e2 = e2;
        this.c1 = c1
        this.c2 = c2;
        this.p1 = p1;
        this.p2 = p2;
        this.is_weak = is_weak;
        this.attributes = attribute;
    }

    addAttribute(attribute){
        this.attributes.push(attribute);
    }
}

class ER{
    constructor(){
        this.entities = [];
        this.relations = [];
        this.entity_map = {};
    }
    addEntity(entity){
        this.entities.push(entity);
    }

    addRelation(relation){
        this.relations.push(relation);
    }
}

module.exports = {Entity, Attribute, Relation, ER};

//parse univ_db.json to ER object
// var fs = require('fs');
// var convert_json_to_ER = require('./json_convert.js');
// var json = fs.readFileSync('univ_db.json', 'utf8');


// frontend json -> parsed json -> ER class -> SQL

// function convert_ER_to_json(er){

// }

// function convert_json_to_ER(json){
    

// }

// function strong_entity_2sql(entity){
//     // start code
//     var sql = "CREATE TABLE " + entity.name + " (";
//     for (var i = 0; i < entity.attributes.length; i++){
//         var attribute = entity.attributes[i];
//         sql += attribute.name + " " + attribute.data_type;
//         if (attribute.is_key){
//             sql += " PRIMARY KEY";
//         }
//         if (i != entity.attributes.length - 1){
//             sql += ", ";
//         }
//     }
//     sql += ");\n";
//     return sql;
//     // end code
// }

// function mtmrelation_to_sql(relation){
//     // start code
//     var sql = "CREATE TABLE " + relation.name + " (";
//     e1 = relation.e1;
//     e2 = relation.e2;
//     primary_list = []
//     for (var i=0;i<e1.attributes.length;i++){
//         var attribute = e1.attributes[i];
//         if(attribute.is_key){
//             sql += attribute.name + " " + attribute.data_type;
//             primary_list.push([attribute.name, e1.name]);
//         }
//     }
//     for (var i=0;i<e2.attributes.length;i++){
//         var attribute = e2.attributes[i];
//         if(attribute.is_key){
//             sql += attribute.name + " " + attribute.data_type;
//             primary_list.push([attribute.name, e2.name]);
//         }
//     }
//     sql += " PRIMARY KEY (";
//     for (var i=0;i<primary_list.length;i++){
//         sql += primary_list[i][0];
//         if(i!=primary_list.length-1){
//             sql += ", ";
//         }
//     }
//     for (var i=0;i<primary_list.length;i++){
//         sql += "), FOREIGN KEY (" + primary_list[i][0] + ") REFERENCES " + primary_list[i][1]+",";
//     }
//     sql += "));\n";
//     return sql;
//     // end code

// }


// function convert_ER_to_SQL(er){
//     // for each entity, create a table
//     // for each relation, create a table
//     // for each attribute, create a column
//     // for each relation, create a foreign key
//     // for each weak entity, create a foreign key

//     // start code
//     var sql = "";
//     for (var i = 0; i < er.entities.length; i++){
//         var entity = er.entities[i];
//         sql += "CREATE TABLE " + entity.name + " (";
//         for (var j = 0; j < entity.attributes.length; j++){
//             var attribute = entity.attributes[j];
//             sql += attribute.name + " " + attribute.data_type;
//             if (attribute.is_key){
//                 sql += " PRIMARY KEY";
//             }
//             if (j != entity.attributes.length - 1){
//                 sql += ", ";
//             }
//         }
//         sql += ");\n";
//     }

//     // deal with weak entities
//     for (var i = 0; i < er.entities.length; i++){
//         var entity = er.entities[i];
//         if (entity.is_weak){
//             sql += "ALTER TABLE " + entity.name + " ADD FOREIGN KEY (";
//             var relation = er.relations[i];
//             var weak_entity = relation.entities[0];
//             sql += weak_entity.name + ") REFERENCES " + weak_entity.name + ";\n";
//         }
//     }

//     for (var i = 0; i < er.relations.length; i++){
//         var relation = er.relations[i];
//         sql += "CREATE TABLE " + relation.name + " (";
//         for (var j = 0; j < relation.entities.length; j++){
//             var entity = relation.entities[j];
//             sql += entity.name + " " + entity.data_type;
//             if (j != relation.entities.length - 1){
//                 sql += ", ";
//             }
//         }
//         sql += ");\n";
//     }

//     return sql;
//     // end code
// }

