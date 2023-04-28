function init() {
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram =
      $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
        {
          "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
          "LinkRelinked": showLinkLabel,
          "undoManager.isEnabled": true,  // enable undo & redo
          "allowZoom": true,
          "allowHorizontalScroll": true,
          "allowVerticalScroll": true,
        });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", e => {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.slice(0, idx);
      }
    });

    // helper definitions for node templates

    function nodeStyle() {
      return [
        // The Node.location comes from the "loc" property of the node data,
        // converted by the Point.parse static method.
        // If the Node.location is changed, it updates the "loc" property of the node data,
        // converting back using the Point.stringify static method.
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          // the Node.location is at the center of each node
          locationSpot: go.Spot.Center
        }
      ];
    }

    // Define a function for creating a "port" that is normally transparent.
    // The "name" is used as the GraphObject.portId,
    // the "align" is used to determine where to position the port relative to the body of the node,
    // the "spot" is used to control how links connect with the port and whether the port
    // stretches along the side of the node,
    // and the boolean "output" and "input" arguments control whether the user can draw links from or to the port.
    function makePort(name, align, spot, output, input) {
      var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
      // the port is basically just a transparent rectangle that stretches along the side of the node,
      // and becomes colored when the mouse passes over it
      return $(go.Shape,
        {
          fill: "transparent",  // changed to a color in the mouseEnter event handler
          strokeWidth: 0,  // no stroke
          width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
          height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
          alignment: align,  // align the port on the main Shape
          stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
          portId: name,  // declare this object to be a "port"
          fromSpot: spot,  // declare where links may connect at this port
          fromLinkable: output,  // declare whether the user may draw links from here
          toSpot: spot,  // declare where links may connect at this port
          toLinkable: input,  // declare whether the user may draw links to here
          cursor: "pointer",  // show a different cursor to indicate potential link point
          mouseEnter: (e, port) => {  // the PORT argument will be this Shape
            if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
          },
          mouseLeave: (e, port) => port.fill = "transparent"
        });
    }

    function textStyle() {
      return {
        font: "bold 11pt Lato, Helvetica, Arial, sans-serif",
        stroke: "#F8F8F8"
      }
    }

    // A button-defining helper function that returns a click event handler.
    // PROPNAME is the name of the data property that should be set to the given VALUE.
    function ClickFunction(propname, value) {
      if (propname != 'dir') {
        return (e, obj) => {
          e.handled = true;  // don't let the click bubble up
          e.diagram.model.commit(m => {
            m.set(obj.part.adornedPart.data, propname, value);
          });
        };
      }
      else {
        return (e, obj) => {
          console.log(value);
          e.handled = true;  // don't let the click bubble up
          e.diagram.model.commit(m => {
            m.set(obj.part.adornedPart.data, "from_arrow", (((value == 1) || (value == 3)) ? true : false));
            m.set(obj.part.adornedPart.data, "to_arrow", (((value == 2) || (value == 3)) ? true : false));
          });
        };
      }
    }

    function ArrowButton(num) {
      var geo = "";
      if (num === 0) {
        geo = "M0 0 M16 16 M0 8 L16 8";
      }
      if (num == 1) {
        geo = "M0 0 M16 16 M0 8 L16 8 M4 11 L0 8 L4 5";
      }
      if (num == 2) {
        geo = "M0 0 M16 16 M0 8 L16 8  M12 11 L16 8 L12 5";
      }
      if (num === 3) {
        geo = "M0 0 M16 16 M0 8 L16 8  M12 11 L16 8 L12 5  M4 11 L0 8 L4 5";
      }
      return $(go.Shape,
        {
          geometryString: geo,
          margin: 2, background: "transparent",
          mouseEnter: (e, shape) => shape.background = "dodgerblue",
          mouseLeave: (e, shape) => shape.background = "transparent",
          click: ClickFunction("dir", num), contextClick: ClickFunction("dir", num)
        });
    }

    function AllSidesButton(to) {
      var setter = (e, shape) => {
        e.handled = true;
        e.diagram.model.commit(m => {
          var link = shape.part.adornedPart;
          m.set(link.data, (to ? "toSpot" : "fromSpot"), go.Spot.stringify(go.Spot.AllSides));
          // re-spread the connections of other links connected with the node
          (to ? link.toNode : link.fromNode).invalidateConnectedLinks();
        });
      };
      return $(go.Shape,
        {
          width: 12, height: 12, fill: "transparent",
          mouseEnter: (e, shape) => shape.background = "dodgerblue",
          mouseLeave: (e, shape) => shape.background = "transparent",
          click: setter, contextClick: setter
        });
    }

    function SpotButton(spot, to) {
      var ang = 0;
      var side = go.Spot.RightSide;
      if (spot.equals(go.Spot.Top)) { ang = 270; side = go.Spot.TopSide; }
      else if (spot.equals(go.Spot.Left)) { ang = 180; side = go.Spot.LeftSide; }
      else if (spot.equals(go.Spot.Bottom)) { ang = 90; side = go.Spot.BottomSide; }
      if (!to) ang -= 180;
      var setter = (e, shape) => {
        e.handled = true;
        e.diagram.model.commit(m => {
          var link = shape.part.adornedPart;
          m.set(link.data, (to ? "toSpot" : "fromSpot"), go.Spot.stringify(side));
          // re-spread the connections of other links connected with the node
          (to ? link.toNode : link.fromNode).invalidateConnectedLinks();
        });
      };
      return $(go.Shape,
        {
          alignment: spot, alignmentFocus: spot.opposite(),
          geometryString: "M0 0 M12 12 M12 6 L1 6 L4 4 M1 6 L4 8",
          angle: ang,
          background: "transparent",
          mouseEnter: (e, shape) => shape.background = "dodgerblue",
          mouseLeave: (e, shape) => shape.background = "transparent",
          click: setter, contextClick: setter
        });
    }

    // create a button that brings up the context menu
    function CMButton(options) {
      return $(go.Shape,
        {
          fill: "orange", stroke: "gray", background: "transparent",
          geometryString: "F1 M0 0 M0 4h4v4h-4z M6 4h4v4h-4z M12 4h4v4h-4z M0 12",
          isActionable: true, cursor: "context-menu",
          click: (e, shape) => {
            e.diagram.commandHandler.showContextMenu(shape.part.adornedPart);
          }
        },
        options || {});
    }

    // Create a context menu button for setting a data property with a stroke width value.
    function ThicknessButton(sw, propname) {
      if (!propname) propname = "thickness";
      return $(go.Shape, "LineH",
        {
          width: 16, height: 16, strokeWidth: sw,
          margin: 1, background: "transparent",
          mouseEnter: (e, shape) => shape.background = "dodgerblue",
          mouseLeave: (e, shape) => shape.background = "transparent",
          click: ClickFunction(propname, sw), contextClick: ClickFunction(propname, sw)
        });
    }

    // Create a context menu button for setting a data property with a stroke dash Array value.
    function DashButton(dash, propname) {
      if (!propname) propname = "dash";
      return $(go.Shape, "LineH",
        {
          width: 24, height: 16, strokeWidth: 2,
          strokeDashArray: dash,
          margin: 1, background: "transparent",
          mouseEnter: (e, shape) => shape.background = "dodgerblue",
          mouseLeave: (e, shape) => shape.background = "transparent",
          click: ClickFunction(propname, dash), contextClick: ClickFunction(propname, dash)
        });
    }

    function StrokeOptionsButtons() {  // used by multiple context menus
      return [
        $("ContextMenuButton",
          $(go.Panel, "Horizontal",
            ThicknessButton(1.5), ThicknessButton(4)
          )
        ),
        $("ContextMenuButton",
          $(go.Panel, "Horizontal",
            DashButton(null), DashButton([2, 4])
          )
        )
      ];
    }

    // define the Node templates for regular nodes

    myDiagram.nodeTemplateMap.add("Entity",  // the default category
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Relation Attribute",  // the default category
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            { fill: "#282c34", stroke: "#8058d6", strokeWidth: 3.5 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      ));


    myDiagram.nodeTemplateMap.add("Relation Primary Key",  // the default category
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            { fill: "#282c34", stroke: "#d816db", strokeWidth: 3.5 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Weak Entity",
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            { fill: "#282c34", stroke: "#9c2494", strokeWidth: 4.5, strokeDashArray: [2, 2] },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Relationship",
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Diamond",
            { fill: "#282c34", stroke: "#662ae8", strokeWidth: 3 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.Top, false, true),
        makePort("L", go.Spot.Left, go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Weak Entity Relationship",
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Diamond",
            { fill: "#282c34", stroke: "#9c2494", strokeWidth: 4.5, strokeDashArray: [2, 2] },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // four named ports, one on each side:
        makePort("T", go.Spot.Top, go.Spot.Top, false, true),
        makePort("L", go.Spot.Left, go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Start",
      $(go.Node, "Table", nodeStyle(),
        $(go.Panel, "Spot",
          $(go.Shape, "Circle",
            { desiredSize: new go.Size(70, 70), fill: "#282c34", stroke: "#09d3ac", strokeWidth: 3.5 }),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // three named ports, one on each side except the top, all output only:
        makePort("L", go.Spot.Left, go.Spot.Left, true, false),
        makePort("R", go.Spot.Right, go.Spot.Right, true, false),
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Primary_key",
      $(go.Node, "Table", nodeStyle(),
        $(go.Panel, "Spot",
          $(go.Shape, "Circle",
            { desiredSize: new go.Size(70, 70), fill: "#282c34", stroke: "#99271d", strokeWidth: 3.5 }),
          $(go.TextBlock, textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        // three named ports, one on each side except the top, all output only:
        makePort("L", go.Spot.Left, go.Spot.Left, true, false),
        makePort("R", go.Spot.Right, go.Spot.Right, true, false),
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));

    // taken from ../extensions/Figures.js:
    go.Shape.defineFigureGenerator("File", (shape, w, h) => {
      var geo = new go.Geometry();
      var fig = new go.PathFigure(0, 0, true); // starting point
      geo.add(fig);
      fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
      fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
      fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
      var fig2 = new go.PathFigure(.75 * w, 0, false);
      geo.add(fig2);
      // The Fold
      fig2.add(new go.PathSegment(go.PathSegment.Line, .75 * w, .25 * h));
      fig2.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
      geo.spot1 = new go.Spot(0, .25);
      geo.spot2 = go.Spot.BottomRight;
      return geo;
    });

    myDiagram.nodeTemplateMap.add("Comment",
      $(go.Node, "Auto", nodeStyle(),
        $(go.Shape, "File",
          { fill: "#282c34", stroke: "#DEE0A3", strokeWidth: 3 }),
        $(go.TextBlock, textStyle(),
          {
            margin: 8,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            editable: true
          },
          new go.Binding("text").makeTwoWay())
        // no ports, because no links are allowed to connect with a comment
      ));


    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 5,
          toShortLength: 4,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          selectionAdorned: false
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape, { strokeWidth: 1.5, stroke: "gray" },
          new go.Binding("strokeWidth", "thickness").makeTwoWay(),
          new go.Binding("strokeDashArray", "dash").makeTwoWay()),
        $(go.Shape,  // the arrowhead
          { toArrow: "standard", strokeWidth: 0, fill: "gray", visible: false },
          new go.Binding("visible", "to_arrow").makeTwoWay()),
        $(go.Shape,  // the arrowhead
          { fromArrow: "backward", strokeWidth: 0, fill: "gray", visible: false },
          new go.Binding("visible", "from_arrow").makeTwoWay()),
        $(go.TextBlock,
          { alignmentFocus: new go.Spot(0, 1, -4, 0), editable: true, stroke: "#20d1e8" },
          new go.Binding("text").makeTwoWay())  // TwoWay due to user editing with TextEditingTool
        // $(go.Panel, "Auto",  // the link label, normally not visible
        //   { visible: true, name: "LABEL1", segmentIndex: 0, segmentFraction: 0.5, segmentOrientation: go.Link.OrientUpright },
        //   new go.Binding("visible", "visible").makeTwoWay(),
        //   $(go.Shape, "RoundedRectangle",  // the label shape
        //     { fill: "#F8F8F8", strokeWidth: 0 }),
        //   $(go.TextBlock, "",  // the label
        //     {
        //       textAlign: "center",
        //       font: "10pt helvetica, arial, sans-serif",
        //       stroke: "#333333",
        //       segmentIndex: 0,
        //       editable: true
        //     },
        //     new go.Binding("text", "fromText").makeTwoWay())
        // ),
      );

    myDiagram.linkTemplate.selectionAdornmentTemplate =
      $(go.Adornment,  // use a special selection Adornment that does not obscure the link path itself
        $(go.Shape,
          { // this uses a pathPattern with a gap in it, in order to avoid drawing on top of the link path Shape
            isPanelMain: true,
            stroke: "transparent", strokeWidth: 6,
            pathPattern: makeAdornmentPathPattern(2)  // == thickness or strokeWidth
          },
          new go.Binding("pathPattern", "thickness", makeAdornmentPathPattern)),
        CMButton({ alignmentFocus: new go.Spot(0, 0, -6, -4) })
      );

    myDiagram.linkTemplate.contextMenu =
      $("ContextMenu",
        StrokeOptionsButtons(),
        $("ContextMenuButton",
          $(go.Panel, "Horizontal",
            ArrowButton(0), ArrowButton(1), ArrowButton(2), ArrowButton(3)
          )
        ),
      );

    function makeAdornmentPathPattern(w) {
      return $(go.Shape,
        {
          stroke: "dodgerblue", strokeWidth: 2, strokeCap: "square",
          geometryString: "M0 0 M4 2 H3 M4 " + (w + 4).toString() + " H3"
        });
    }

    // Make link labels visible if coming out of a "conditional" node.
    // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
    function showLinkLabel(e) {
      var label = e.subject.findObject("LABEL");
      // if (label !== null) label.visible = (e.subject.fromNode.data.category === "Conditional");
      console.log("hello");
    }

    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;


    // function loadJSONFile(filePath, elementId) {
    //   var xhr = new XMLHttpRequest();
    //   xhr.onreadystatechange = function () {
    //     if (xhr.readyState === 4 && xhr.status === 200) {
    //       document.getElementById(elementId).innerHTML = xhr.responseText;
    //     }
    //   };
    //   xhr.open("GET", filePath, true);
    //   xhr.send();
    // }

    // loadJSONFile("Univ_Schema.json", "mySavedModel");

    load();  // load an initial diagram from some JSON text

    // initialize the Palette that is on the left side of the page
    myPalette =
      $(go.Palette, "myPaletteDiv",  // must name or refer to the DIV HTML element
        {
          // Instead of the default animation, use a custom fade-down
          "animationManager.initialAnimationStyle": go.AnimationManager.None,
          "InitialAnimationStarting": animateFadeDown, // Instead, animate with this function

          nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
          model: new go.GraphLinksModel([  // specify the contents of the Palette
            { category: "Start", text: "Attributes" },
            { category: "Primary_key", text: "Primary\nKey" },
            { category: "Entity", text: "Entity" },
            { category: "Relationship", text: "Relationship" },
            { category: "Relation Attribute", text: "Rel_Attribute" },
            { category: "Relation Primary Key", text: "Rel_PrimaryKey" },
            { category: "Weak Entity", text: "Weak Entity" },
            { category: "Weak Entity Relationship", text: "Weak Entity Relationship" },
          ])
        });

    // This is a re-implementation of the default animation, except it fades in from downwards, instead of upwards.
    function animateFadeDown(e) {
      var diagram = e.diagram;
      var animation = new go.Animation();
      animation.isViewportUnconstrained = true; // So Diagram positioning rules let the animation start off-screen
      animation.easing = go.Animation.EaseOutExpo;
      animation.duration = 900;
      // Fade "down", in other words, fade in from above
      animation.add(diagram, 'position', diagram.position.copy().offset(0, 200), diagram.position);
      animation.add(diagram, 'opacity', 0, 1);
      animation.start();
    }

  } // end init
  function clearDiagram() {
    clearjson =   {
        "class": "GraphLinksModel",
        "linkFromPortIdProperty": "fromPort",
        "linkToPortIdProperty": "toPort",
        "nodeDataArray": [],
        "linkDataArray": []
      }
    myDiagram.model = go.Model.fromJson(clearjson);
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
  }


  // Show the diagram's model in JSON format that the user may edit
  function save() {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    console.log(myDiagram.model)
    console.log(myDiagram.model.linkDataArray)
    myDiagram.isModified = false;
  }
  function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
  }

  // print the diagram by opening a new window holding SVG images of the diagram contents for each page
  function printDiagram() {
    var svgWindow = window.open();
    if (!svgWindow) return;  // failure to open a new Window
    var printSize = new go.Size(15000, 1500);
    var bnds = myDiagram.documentBounds;
    var x = bnds.x;
    var y = bnds.y;
    while (y < bnds.bottom) {
      while (x < bnds.right) {
        var svg = myDiagram.makeSvg({ scale: 1.0, position: new go.Point(x, y), size: printSize });
        svgWindow.document.body.appendChild(svg);
        x += printSize.width;
      }
      x = bnds.x;
      y += printSize.height;
    }
    // setTimeout(() => svgWindow.print(), 1);
  }
  window.addEventListener('DOMContentLoaded', init);
  function callER(){
    let frontend_json = document.getElementById("mySavedModel").value;
    // console.log(frontend_json);
    let backend_json = JSON.parse(frontend_json);
    fetch('http://localhost:3000/er_to_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backend_json),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
      document.getElementById("outputSQL").value = data["sql"];
    })
    .catch((error) => {
      console.error('Error:', error);
    });
      // ajax call to backend

    }