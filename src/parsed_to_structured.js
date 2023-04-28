var {Entity, Attribute, Relation, ER} = require('./ER.js');

function convertToStructuredJson(Json) {
  console.log("Converting to structured json");

  var parsedJson = (Json);
    // let weak_entities = [];
    // let weak_relations = [];
    // let weak_entitynames = [];
    let relattributes = [];  
    let relations = [];
    let attributes = [];
    let entities = [];
    let attributeMap = {};
    let keymapping = new Map();
    // // Map entity key
    // let keyAttribute = parsedJson.nodeDataArray.find(attr => attr.key === node.key && attr.category === "Primary_key");
    // if (keyAttribute) {
    //   entity.attributes.push({
    //     name: keyAttribute.text,
    //     type: "string",
    //     is_key: true
    //   });
    //   attributeMap[keyAttribute.key] = keyAttribute;
    // }

    // // Map other attributes
    // parsedJson.nodeDataArray.filter(attr => attr.category === "Start" && attr.key !== keyAttribute?.key)
    //   .forEach(attr => {
    //     entity.attributes.push({
    //       name: attr.text,
    //       type: attr.text === "budget" ? "int" : "string",
    //       is_key: false
    //     });
    //     attributeMap[attr.key] = attr;
          //   });
    
    // parse the NodeDataArray
    if (parsedJson && parsedJson.nodeDataArray) {
      parsedJson.nodeDataArray.forEach(node => {
        if (node.category === "Entity") {
          let entity = {
            name: (node.text).replace(/\n/g, ""),
            is_weak: false,
            attributes: [],
            key: node.key
          };
          entities.push(entity);
          keymapping.set(node.key, "Entity");
        }
        else if (node.category === "Weak Entity"){
          let weak_entity = {
            name: (node.text).replace(/\n/g, ""),
            is_weak: true,
            attributes: [],
            key: node.key
          };
          entities.push(weak_entity);
          keymapping.set(node.key, "Entity");
        }
        else if (node.category === "Start"){
          let attribute = {
            name: (node.text).replace(/\n/g, ""),
            type: "",
            is_key: false,
            key: node.key
          };
          attributes.push(attribute);
          keymapping.set(node.key, "Attribute");
        }
        else if (node.category === "Primary_key"){
          let pkey = {
            name: (node.text).replace(/\n/g, ""),
            type: "",
            is_key: true,
            key: node.key
          };
          attributes.push(pkey);
          keymapping.set(node.key, "Attribute");
        }
        else if (node.category === "Relationship"){
          let relation = {
            name: (node.text).replace(/\n/g, ""),
            is_weak: false,
            e1: "",
            c1: "",
            p1: "",
            e2: "",
            c2: "",
            p2: "",
            attributes: [],
            key: node.key
          };
          relations.push(relation);
          keymapping.set(node.key, "Relationship");
        }
        else if (node.category === "Weak Entity Relationship"){
          let weak_relation = {
            name: (node.text).replace(/\n/g, ""),
            is_weak: true,
            e1: "",
            c1: "",
            p1: "",
            e2: "",
            c2: "",
            p2: "",
            attributes: [],
            key: node.key
          };
          relations.push(weak_relation);
          keymapping.set(node.key, "Relationship");
        }
        else if (node.category === "Relation Attribute"){
          let relationattr = {
            name: (node.text).replace(/\n/g, ""),
            type: "",
            is_key: false,
            key: node.key
          };
          relattributes.push(relationattr);
          keymapping.set(node.key, "Relation Attribute");
        }
      });
    }
      // parse the LinkDataArray
      if (parsedJson && parsedJson.linkDataArray) {
        parsedJson.linkDataArray.forEach(node => {
          let fromnode = keymapping.get(node.from);
          let tonode = keymapping.get(node.to);

          if (fromnode === "Entity" && tonode === "Attribute"){
            let entity = entities.find(entity => entity.key === node.from);
            let attribute = attributes.find(attribute => attribute.key === node.to);
            attribute.type = (node.text).replace(/\n/g, "");
            entity.attributes.push(attribute);
          }
          else if (fromnode === "Attribute" && tonode === "Entity"){
            let entity = entities.find(entity => entity.key === node.to);
            let attribute = attributes.find(attribute => attribute.key === node.from);
            attribute.type = (node.text).replace(/\n/g, "");
            entity.attributes.push(attribute);
          }

          else if (fromnode === "Entity" && tonode === "Relationship"){
            let entity = entities.find(entity => entity.key === node.from);
            let relation = relations.find(relation => relation.key === node.to);
            if (relation.e1 === ""){
              relation.e1 = entity.name;
              if(node.from_arrow === true || node.to_arrow === true){
                relation.c1 = "one";
              }
              else{
                relation.c1 = "many";
              }
              if(node.thickness === 4){
                relation.p1 = "total";
              }
              else{
                relation.p1 = "partial";
              }
            }
            else{
              relation.e2 = entity.name;
              if(node.from_arrow === true || node.to_arrow === true){
                relation.c2 = "one";
              }
              else{
                relation.c2 = "many";
              }
              if(node.thickness === 4){
                relation.p2 = "total";
              }
              else{
                relation.p2 = "partial";
              }
            }
          }

          else if (fromnode === "Relationship" && tonode === "Entity"){
            let entity = entities.find(entity => entity.key === node.to);
            let relation = relations.find(relation => relation.key === node.from);
            if (relation.e1 === ""){
              relation.e1 = entity.name;
              if(node.from_arrow === true || node.to_arrow === true){
                relation.c1 = "one";
              }
              else{
                relation.c1 = "many";
              }
              if(node.thickness === 4){
                relation.p1 = "total";
              }
              else{
                relation.p1 = "partial";
              }
            }
            else{
              relation.e2 = entity.name;
              if(node.from_arrow === true || node.to_arrow === true){
                relation.c2 = "one";
              }
              else{
                relation.c2 = "many";
              }
              if(node.thickness === 4){
                relation.p2 = "total";
              }
              else{
                relation.p2 = "partial";
              }
            }
          }

          else if (fromnode === "Relationship" && tonode === "Relation Attribute"){
            let relation = relations.find(relation => relation.key === node.from);
            let relationattr = relattributes.find(relationattr => relationattr.key === node.to);
            relationattr.type = (node.text).replace(/\n/g, "");
            relation.attributes.push(relationattr);
          }

          else if (fromnode === "Relation Attribute" && tonode === "Relationship"){
            let relation = relations.find(relation => relation.key === node.to);
            let relationattr = relattributes.find(relationattr => relationattr.key === node.from);
            relationattr.type = (node.text).replace(/\n/g, "");
            relation.attributes.push(relationattr);
          }
        });
    }
    // combine the entities and relations into one object
    let entitiesAndRelations = {
      entities: entities,
      relations: relations
    };
    console.log("returing strcutired json");
    // return the entities and relations
    return entitiesAndRelations;


}
  

    // var fs = require('fs');
    // var json = fs.readFileSync('Univ_Schema.json', 'utf8');
    // var parsedJson = JSON.parse(json);
    // var structuredJson = convertToStructuredJson(parsedJson);
    // fs.writeFileSync('Univ_Schema_structured.json', JSON.stringify(structuredJson, null, 2), 'utf8');
    // console.log("Structured JSON written to Univ_Schema_structured.json");

    module.exports = convertToStructuredJson;
  
