var { Entity, Attribute, Relation, ER } = require('./ER.js');

function convert_json_to_ER(json) {
    // create ER object from json   
    var er = new ER();
    // stoe in a map entity name -> entity
    for (var i = 0; i < json.entities.length; i++) {
        var entity = json.entities[i];
        var attributes = [];
        for (var j = 0; j < entity.attributes.length; j++) {
            var attribute = entity.attributes[j];
            attributes.push(new Attribute(attribute.name, attribute.type, attribute.is_key));
        }
        er.addEntity(new Entity(entity.name, attributes, entity.is_weak));
        er.entity_map[entity.name] = er.entities[i];
    }

    for (var i = 0; i < json.relations.length; i++) {
        var relation = json.relations[i];
        var e1 = er.entity_map[relation.e1];
        var e2 = er.entity_map[relation.e2];
        var c1 = relation.c1;
        var c2 = relation.c2;
        var p1 = relation.p1;
        var p2 = relation.p2;
        var attributes = [];
        for (var j = 0; j < relation.attributes.length; j++) {
            var attribute = relation.attributes[j];
            attributes.push(new Attribute(attribute.name, attribute.type, attribute.is_key));
        }
        er.addRelation(new Relation(relation.name, e1, e2, c1, c2, p1, p2, relation.is_weak, attributes));
    }
    return er;
}

// var fs = require('fs');
// var json = fs.readFileSync('Univ_Schema_structured.json', 'utf8');
// er=convert_json_to_ER(json);
module.exports = convert_json_to_ER;
