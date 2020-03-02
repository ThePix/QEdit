"use strict";


createRoom("_oldcastle",
  {
    name:"_oldcastle",
    inherit:"editor_room",
    roomtype:"Zone",
    alias:"Old Castle Zone",
    usedefaultprefix:false,
    desc:"None",
  }
);


createRoom("yourchambers",
  {
    name:"yourchambers",
    loc:"_oldcastle",
    inherit:"editor_room",
    alias:"Your Chambers",
    usedefaultprefix:false,
    roomtype:"Upper level room",
    beforefirstenter:[undefined],
    firstenter:[undefined],
    enter:[undefined],
    east:new Exit("landing"),
    north:new Exit("yourbedroom"),
    command:"
        <pattern>^wait$|^z$</pattern>
        <script>
          if (game.invaded) {
            msg ("'Well, get going, Jenina,' says the painting. 'You're not going to sort this out just standing their like a bewildered sheep.'")
          }
          else {
            msg ("'Shape yourself, Jenina,' says the painting. 'You've lots to do.'")
          }
        </script>
      ",
    desc:"This room is your public face to the world; this is where you greet visitors who want to bend your ear or outright bribe you. Even the King himself has visited you here once or twice, and so you have taken the time to esure the room is richly furnished over the years. The walls are hung with tapestries, the chairs are well-upholstered, and the desk is an exquisite example of marquetry. In each corner a vase stands on it wn pedastal.
To the north is your bedroom; a private room for you alone. To the northwest, hidden by a tapestry, and enchantments too, is a secret passage to your laboratory. Naturally the laboratory is for you alone too. You exit your chambers via the door to the east, whilst to the south is a window over looking the higher courtyard.",
  }
);


createItem("player",
  PLAYER
  {
    name:"player",
    loc:"yourchambers",
    inherit:"editor_player",
    pov_alias:"Jenina",
  }
);


createItem("painting_mother",
  {
    name:"painting_mother",
    loc:"yourchambers",
    inherit:"talkingchar",
    alias:"painting",
    scenery:false,
    listalias:"Painting of your Mother",
    examine:"This is a painting of your mother, from the chest up, wearing a white dress and rather too much jewellery. Its eyes seem to follow you round the room, which is probably because your mother uses the painting to watch you. If necessary you can talk to her through the painting, but usually the communication is in the opposite direction.",
  }
);


createItem("mother_men_description",
  {
    name:"mother_men_description",
    loc:"painting_mother",
    inherit:"topic",
    alias:"Describe the men",
    exchange:"'What can you tell me about the men,' you ask your mother.
'Oh, well, let me see. there were two of them. I find it terribly difficult to judge size through these things, but well-built and on the tall side, I would say. Branishing swords, and wearing leather armour and metal helmets. One was quite good-looking, apart from a scar across his chin.'",
  }
);


createItem("mother_men_doing",
  {
    name:"mother_men_doing",
    loc:"painting_mother",
    inherit:"topic",
    alias:"What were the men doing?",
    exchange:"'What were the men doing in my rooms?' you ask your mother.
'Looking for you, I suspect. They shouted for you, and went into your bedroom, but had left within moments. I was quiye by luch that I noticed them at all.'<br/>'Yeah...' It was not like she spent every moment of the day watching you.",
  }
);


createItem("mother_help",
  {
    name:"mother_help",
    loc:"painting_mother",
    inherit:"topic",
    alias:"Help me find out what is happening",
    exchange:"'Can you help me find out what's happening?' you ask the painting.
'Me?'<br/>'Yes, you. Do some scrying or something. You used to be good at it.'<br/>'I still am!' she replies haughtily. 'Well, I suppose I could. If you think it is that important.'<br/>'Yes, it really is.'",
  }
);


createItem("mother_scrying1",
  {
    name:"mother_scrying1",
    loc:"painting_mother",
    inherit:"topic",
    alias:"Scrying result",
    exchange:"'Have you had any luck scrying?' you ask your mother.
'Give me a chance, dear.'",
    hideafter:false,
  }
);


createItem("mother_scrying2",
  {
    name:"mother_scrying2",
    loc:"painting_mother",
    inherit:"topic",
    alias:"Scrying result",
    exchange:"'Have you had any more luck scrying?' you ask your mother.
'No. Whatever I try, it's still blocked, I'm afraid.'",
,
  }
);


createItem("mother_scrying3",
  {
    name:"mother_scrying3",
    loc:"painting_mother",
    inherit:"topic",
    alias:"Scrying result",
    exchange:"'Have you had any luck scrying?' you ask your mother.
'Not a lot - which is rather worrying. As you know, my skill at scrying is not modest...' {i:Unlike you}, you say to yourself. '... And so I can say with some certainty that someone is actively trying to block my attempts. The king is fine, at least for now, I can see him, riding his pet hellcat; it is the business at the castle that is obscured. What will happen when the king returns to the castle, I would not like to think upon.'<br/>'Hmm, well thanks for that.'<br/>'Be careful, dear, dark forces are afoot. Besides us, I mean.'",
  }
);


createRoom("laboratory",
  {
    name:"laboratory",
    loc:"_oldcastle",
    inherit:"editor_room",
    alias:"Secret laborary",
    roomtype:"Other",
    usedefaultprefix:false,
    implementation_notes:"Need janthherb to brew the Reklindraa
}<br/>",
    enter:[undefined],
    east:new Exit("yourbedroom"),
    desc:"This is where you perform your dark rituals and concoct your foul potions. Hidden within the width of the outer walls, it is long and thin, and windowless. Along the long east side are workbenches, and above them shelves lines with jars.",
  }
);


createRoom("yourbedroom",
  {
    name:"yourbedroom",
    loc:"_oldcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    alias:"Your bedroom",
    usedefaultprefix:false,
    south:new Exit("yourchambers"),
    west:new Exit("laboratory"),
    desc:"Your bedroom is relatively austere -  material trapping are not of any signficance to you - though the bed is large and soft. A wardrobe stores your clothing. A small window, just large enough for an archer, looks out onto the fields below.{once: All evidence of your dark rituals is absent.}",
  }
);


createRoom("landing",
  {
    name:"landing",
    loc:"_oldcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    alias:"Old Castle Landing",
    usedefaultprefix:false,
    west:new Exit("yourchambers"),
    north:new Exit("tilitzhroom"),
    down:new Exit("greathall"),
    desc:"The landing runs north to south, along the west side of the great hall. {once:This is the old part of the castle, built about six hundred years ago, when defence was more important than comfort. The walls are thick, and the windows narrow.}
There are doors north, west and southwest, as well the the stairs down to the hall itself.",
  }
);


createRoom("greathall",
  {
    name:"greathall",
    loc:"_oldcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    usedefaultprefix:false,
    alias:"The Great Hall",
    up:new Exit("landing"),
    south:new Exit("oldbridge"),
    desc:"The great hall is approximately square, with a stone floor and walls, and a high hammer beam roof. There is a large table in the middle, and you sometimes wonder if it is as old as the hall itself. You have not known it used whilst you have been at the castle.
A large arched door in the south wall leads to the bridge to the newer parts of the castle, whilst small doors to the north and west lead to servants areas. A flight of stairs leads back up towards your own quarters.",
  }
);


createRoom("tilitzhroom",
  {
    name:"tilitzhroom",
    loc:"_oldcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    usedefaultprefix:false,
    alias:"Tilitzh's Quarters",
    south:new Exit("landing"),
    east:new Exit("tilitzhbedroom"),
    desc:"This is Tilitzh's receiving room. He has clearly made an effort to furnish it in the traditional style of his people{once:; you suspect that is to promote his culture rather than because of longings for home}.
The way out to to the south, his bedroom to the east, and a window to the north.",
  }
);


createRoom("tilitzhbedroom",
  {
    name:"tilitzhbedroom",
    loc:"_oldcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    usedefaultprefix:false,
    alias:"Tilitzh's Bedroom",
    west:new Exit("tilitzhroom"),
    desc:"Unlike his receiving room, Tilitzh has made little effort to decorate this room, and besides the bed and a plain cabinet it is empty.
The way out is west. To north and east are windows, and that one to the east gives a particular good view of he valley below.",
  }
);


createRoom("oldbridge",
  {
    name:"oldbridge",
    loc:"_oldcastle",
    inherit:"editor_room",
    roomtype:"Bridge",
    usedefaultprefix:false,
    alias:"The Old Bridge",
    north:new Exit("greathall"),
    south:new Exit("newhallbalcony"),
    desc:"The old castle and the new were built on separate outcrops, and this bridge spans the gap between them. It is narrow, with only the lowests of walls on either side, which can unnerve some people.",
  }
);


createRoom("_newcastle",
  {
    name:"_newcastle",
    inherit:"editor_room",
    roomtype:"Zone",
    alias:"New Castle Zone",
    usedefaultprefix:false,
    desc:"None",
  }
);


createRoom("newhallbalcony",
  {
    name:"newhallbalcony",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    usedefaultprefix:false,
    alias:"New Hall (Balcony)",
    enter:[undefined],
    north:new Exit("oldbridge"),
    down:new Exit("newhall"),
    south:new Exit("gallery"),
    desc:"This wide balcony overlooks the new hall. In summer, bands play here during balls and banquets, which can make access to the old castle awkward. Steps heads down into the hall itself, whilst there are doors to the north, back to the old castle, and south to the gallery.",
  }
);


createRoom("newhall",
  {
    name:"newhall",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    alias:"New Hall",
    usedefaultprefix:false,
    south:new Exit("innerward"),
    southwest:new Exit("kitchens"),
    up:new Exit("newhallbalcony"),
    desc:"This is the great hall of the new castle, and is generally just called the New Hall. It is a large, airy room, that is always freezing in winter, but in the summer is a great venue for dances and banquets. A door south leads to the Inner Ward, and one to the east goes into the Royal Tower. You can also go southwest to the kitchens or go up thestairs to the balcony that overlooks the room. ",
  }
);


createRoom("gallery",
  {
    name:"gallery",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    alias:"The Gallery",
    usedefaultprefix:false,
    north:new Exit("newhallbalcony"),
    desc:"The gallery runs from north to south, with a door to the New Hall at the north end. Along the east wall, windows overlook the Inner Ward.",
  }
);


createRoom("innerward",
  {
    name:"innerward",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Courtyard",
    alias:"The Inner Ward",
    usedefaultprefix:false,
    north:new Exit("newhall"),
    south:new Exit("diningroomwest"),
    east:new Exit("innergatehouse"),
    up:new Exit("collectorplatform"),
    desc:"The Inner Ward is at the heart of the new castle, surrounded by the castle rooms on all four side, with the Royal Tower rising above all else in the north east corner. Large doors to the west lead to the Inner Gateway. Smaller doors lead north to the new hall, and south to the dining room.
In the southeast corner is a tall metal cylinder, the flux tank. A ladder leaders up to the collector on the roof.",
  }
);


createRoom("diningroomwest",
  {
    name:"diningroomwest",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    alias:"Dining Room (West)",
    usedefaultprefix:false,
    longdesc:"This is the west end of the dining room, where the household eat in winter{once:, and is one of the few rooms outside the Royal Tower to be decorated and furnished in what could be considered a contemporary style}. The room is dominated by a long table, surrounded by twenty four chairs, all of dark wood. The walls are panelled with similar wood.",
    done:false,
    beforefirstenter:[undefined],
    west:new Exit("kitchens"),
    north:new Exit("innerward"),
    east:new Exit("diningroomeast"),
    desc:"Like the other end, the west end of the dining room has a hearth, and it is pleasantly warm here.
A door to the north leads to the decidedly colder Inner Ward, and to the west to the kitchens.",
  }
);


createRoom("diningroomeast",
  {
    name:"diningroomeast",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    alias:"Dining Room (East)",
    usedefaultprefix:false,
    beforefirstenter:[undefined],
    west:new Exit("diningroomwest"),
    up:new Exit("lessergallery"),
    desc:"Like the other end, the east end of the dining room has a hearth, and it is pleasantly warm here.
A door to the north leads to a flight of steps up to the lesser gallery.",
  }
);


createRoom("innergatehouse",
  {
    name:"innergatehouse",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    usedefaultprefix:false,
    alias:"Inner Gatehouse",
    west:new Exit("innerward"),
    east:new Exit("outerward"),
  }
);


createRoom("lessergallery",
  {
    name:"lessergallery",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    alias:"The Lesser Gallery",
    usedefaultprefix:false,
    down:new Exit("diningroomeast"),
    east:new Exit("apprenticeroom"),
    south:new Exit("vizierquarters"),
  }
);


createRoom("apprenticeroom",
  {
    name:"apprenticeroom",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    usedefaultprefix:false,
    alias:"Apprentice's room",
    beforeenter:[undefined],
    enter:[undefined],
    west:new Exit("lessergallery"),
    desc:"This is Kendall's room, the vizier's apprentice. It is pretty basic, with a simple bed, a cabinet and a stool. Because of his position, Kendall also has a desk, positioned under the only window.",
  }
);


createItem("apprentice",
  {
    name:"apprentice",
    loc:"apprenticeroom",
    inherit:"editor_object",
    alias:"Kendall",
    usedefaultprefix:false,
    examine:"Kendall is nineteen, a short, slim man, with long, rather unkempt hair. Despite the season, he is dressed in a white shirt and dark trousers. He has been an apprentice for nearly five years now, and the vizier regards him well. Like most men his age, he is eager to please any woman who will flash some cleavage at him, which is very convenient.",
  }
);


createItem("janthherb",
  {
    name:"janthherb",
    loc:"apprentice",
    inherit:"editor_object",
    alias:"Janthherb",
    examine:"Janthherb is a blue flower that grows in damp, but sheltered locations, usually prefering lower altitudes. The important part of te plant is the short, thin leaf.",
  }
);


createItem("appentice_genymedes",
  {
    name:"appentice_genymedes",
    loc:"apprentice",
    inherit:"startingtopic",
    alias:"Genymedes",
  }
);


createRoom("vizierquarters",
  {
    name:"vizierquarters",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    usedefaultprefix:false,
    alias:"Grand Vizier's Quarters",
    north:new Exit("lessergallery"),
  }
);


createItem("vizier",
  {
    name:"vizier",
    loc:"vizierquarters",
    inherit:"editor_object",
    alias:"Genymedes",
    examine:"Genymedes is a slim man, with raven-black hair and a goatee beard. He is dressed in his usual red robes, with grey trim. Genymedes has been the court vizier for well over twenty years, serving Athulus XVIII before the current king, and to an extent has been the intelligence behind the throne (there has been precious little in front of it).",
  }
);


createRoom("kitchens",
  {
    name:"kitchens",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    alias:"The Kitchens",
    usedefaultprefix:false,
    north:new Exit("newhall"),
    down:new Exit("cellars"),
    south:new Exit("scullery"),
    southeast:new Exit("diningroomwest"),
  }
);


createRoom("scullery",
  {
    name:"scullery",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    alias:"The Scullery",
    usedefaultprefix:false,
    north:new Exit("kitchens"),
  }
);


createRoom("cellars",
  {
    name:"cellars",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Cellar",
    usedefaultprefix:false,
    alias:"The Cellers",
    up:new Exit("kitchens"),
    east:new Exit("secondcrypt"),
    desc:"
{if exit_cellars_secret_passage.visible:You can just see the secret door hiding the passaghe way to the crypt.}",
  }
);


createRoom("collectorplatform",
  {
    name:"collectorplatform",
    loc:"_newcastle",
    inherit:"editor_room",
    roomtype:"Other",
    alias:"Collector Platform",
    usedefaultprefix:false,
    down:new Exit("innerward"),
    north:new Exit("oldbridge"),
    east:new Exit("walkway"),
    desc:"This metal platform juts from the slopping roof over the gallery and ajoining rooms.  It is dominated by the aethyr collector, a large orb of silver filigree.{once: How it works is a secret carefully maintained by the technomancers.}
It would be risky, but from here you could probably get to the ridge tiles, and head north, droppng down onto the old bridge. Or head east, dropping on to the roof of the stables.",
  }
);


createRoom("_outercastle",
  {
    name:"_outercastle",
    inherit:"editor_room",
    roomtype:"Zone",
    usedefaultprefix:false,
    alias:"Outer Castle Zone",
    desc:"None",
  }
);


createRoom("outerward",
  {
    name:"outerward",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Courtyard",
    alias:"The Outer Ward",
    usedefaultprefix:false,
    west:new Exit("innergatehouse"),
    south:new Exit("stables"),
    east:new Exit("outergatehouse"),
    up:new Exit("walkway"),
    southwest:new Exit("chapel"),
    desc:"The outward is a large open area, and in summer is occasionally used to hold festivals. That feels a long way off, you think to yourself, with a shiver. The gateway to the east leads to the bridge, and on to the city, whilst wide steps to the west lead up into the main part of the castle. To the south are the stables and southwest the chapel, and above them, a walkway leads to the barracks and parapets.",
  }
);


createRoom("outergatehouse",
  {
    name:"outergatehouse",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Cellar",
    alias:"Outer Gatehouse",
    usedefaultprefix:false,
    west:new Exit("outerward"),
    east:new Exit("newbridge"),
    desc:"The outer gatehouse is a solidly built tower, with two huge gates, to east and west, barred firmly closed. Each has a rather smaller door set in it, allowing individuals to pass through.
Two guards stand watch, looking very cold.",
  }
);


createRoom("newbridge",
  {
    name:"newbridge",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Bridge",
    snowaddendum:"Fortunately you have no need to visit the city today.",
    alias:"The New Bridge",
    usedefaultprefix:false,
    enter:[undefined],
    west:new Exit("outergatehouse"),
    desc:[undefined],
  }
);


createRoom("stables",
  {
    name:"stables",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    usedefaultprefix:false,
    alias:"The Stables",
    north:new Exit("outerward"),
    desc:"The royal stables are home to the king's hellcats, of which he owns six.{once: They were a present from the King of Raldaach, and quickly became Athulus' pride and joy, and he now takes every opportunity to go hunting on them. Most of the household is scared to death of the fearsome creatures, and two stable hands left as soon as the beasts arrived, but you can see a noble beauty in them, and know certan tricks from the sisterhood that will calm any wild beast.
The hellcats are gone, of course, with Athulus out hunting, no dfoubt riding the biggest of them, but the stables still smell of their musk. Not a pleasant smell, but one that arouses passion.{if not game.invaded: Athulus is sure to be randy as a goat, and you want who he will sate his lust on.}}<br/>At one time the stables were home to the royal carriages, but these are now stored in the city, so the room is bare, besides the partitions that make up the stalls and the straw on the floor.",
  }
);


createRoom("walkway",
  {
    name:"walkway",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    alias:"Walkway",
    usedefaultprefix:false,
    down:new Exit("outerward"),
    south:new Exit("barracks"),
    southwest:new Exit("captainroom"),
    east:new Exit("overgatehouse"),
    desc:"This narrow and unfenced walkway gives access to the barracks, to the south, the captain of the guard's room, southwest, and the chamber about the gate house, to the east.",
  }
);


createRoom("captainroom",
  {
    name:"captainroom",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    alias:"Captain's Room",
    usedefaultprefix:false,
    northeast:new Exit("walkway"),
    desc:"The captain of the royal guard is a prestingious position, and this is his private room.",
  }
);


createRoom("barracks",
  {
    name:"barracks",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Upper level room",
    alias:"The Barracks",
    usedefaultprefix:false,
    north:new Exit("walkway"),
    desc:"This is where a small continguent of soldiers is garrisoned. The castle has a standing force of about thirty to provide the king's royal guard, with fifteen on watch at any time. There are triple bunks for them to sleep in. To the east, arrow slots guard the bridge.",
  }
);


createRoom("overgatehouse",
  {
    name:"overgatehouse",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Lower level room",
    alias:"Over Gateway",
    usedefaultprefix:false,
    southwest:new Exit("walkway"),
    north:new Exit("outlook"),
    desc:"One of the few concessions to defence in the later building work, the gateway is very solidly built, and this is probably the only second storey room with a stone floor. It features a number of "murder holes" in the floor, allowing defenders to attack anyone in the gateway below.
A door to the north gives to a parapet, which in turn leads to the lookout, whilst the door to the southeast heads back to the outer ward.",
  }
);


createRoom("outlook",
  {
    name:"outlook",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Other",
    alias:"The Outlook",
    usedefaultprefix:false,
    south:new Exit("overgatehouse"),
    desc:"The outlook is the top of a low tower; a circular area, walled to north and east to provided protection to defenders. From here you have a glorious view of the valley.
{LookingEast()}<br/>{LookingNorth()}<br/>The parapet continues to the west, where it meets the royal tower, though there is no way into the tower. The only way down from the outlook is back south, by way of the gatehouse.<br/><br/>",
  }
);


createRoom("chapel",
  {
    name:"chapel",
    loc:"_outercastle",
    inherit:"editor_room",
    alias:"Chapel",
    roomtype:"Lower level room",
    usedefaultprefix:false,
    northeast:new Exit("outerward"),
    down:new Exit("crypt"),
    desc:"{once: There was a chapel here before the new castle was built. When the castle was extended, the old chapel was demolishe, and this was built over the original crypt, designed as part of the outer ward.
}The chapel celebrates the local god, Henfu, and goddess, Henbaritara.{once: Local religion holds that Henfu is the up thrusting mountain, and Henbaritara is the valleys below, fed from his mountain streams, and it is from Henbaritara's lush lands that all the crops and livestockcome.} At the back of the chapel, on the south wall, are two shrines, festooned with tokens of fertilty and life, which at this time of year are looking a bit sad and worn. A narrow flight of steps leads down to the crypt.",
  }
);


createRoom("crypt",
  {
    name:"crypt",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Cellar",
    usedefaultprefix:false,
    alias:"Crypt",
    up:new Exit("chapel"),
    west:new Exit("innercrypt"),
    desc:"This is really the antechamber to the crypt itself, which lies to the east, guarded by a necrotic warrior.{once: This were created from Athulus I's personal bodyguard on his death; it is not clear if he volunteered for the duty or not. According to legend, only one of Athulus' bloodline can control him, and so gain entrance to the inner crypt, however, the sisterhood knows that Athulus XII was not the real son of Athulus XI, so there is presumably some other means of control. In these enlightened, necromancy is considered morally bad, of course, but apparently was quite fashionable in those days.} The walls are covered in bas-relief images, depicting how Athulus founded this great nation. Besides the narrow steps back up to the chapel, the only exit is the doorway to the west, guarded by the necrotic warrior. It is noticable that the area around the warrior is dusty and covered in cobwebs, as it the warrior himself, while the rest of the crypt has been kept clean, with torches lit.",
  }
);


createRoom("innercrypt",
  {
    name:"innercrypt",
    loc:"_outercastle",
    inherit:"editor_room",
    roomtype:"Cellar",
    usedefaultprefix:false,
    alias:"Inner Crypt",
    east:new Exit("crypt"),
    west:new Exit("secondcrypt"),
    desc:"The inner crypt is dark and disty, home to the corpses of over a dozen generations of royalty, and, to judge from the cobwebs, several thousand generations of spiders. It is dominated by a sarcophagus, presumably the final resting place of Athulus I, the lid of which depicts a warrior in full plate, his great sword on his chest.
The walls on either side are lined with stone shelves, upon which stone coffins rest.{once: As you eyes adjust to the gloom, you just seen an entrance way on the far side of the crypt.}",
  }
);


createItem("coffins1",
  OPENABLE
  {
    name:"coffins1",
    loc:"innercrypt",
    inherit:"openable",
,
    takemsg:"You do not need to take a coffin with you.",
    feature_container:"",
    open:"",
    alias:"coffin",
    listalias:"Coffin",
    scenery:"",
    openscript:[undefined],
    examine:"The coffins are made of a very pale stone. There are pictures carved into the sides; various courtly scenes. The lids proclaim the occupant is large, scrolling script, together with a list of accomplishments, for the kings. The queens are not so lucky.",
  }
);


createItem("sarcophagus",
  OPENABLE
  {
    name:"sarcophagus",
    loc:"innercrypt",
    inherit:"openable",
    alias:"sarcophagus",
    listalias:"Sarcophagus",
    feature_container:"",
    scenery:"",
    openscript:[undefined],
    examine:"The sarcophagus is carved from a single block of white stone, and stands on a pedastal of like stone. A series of panels carved in the side depict such many pursuits as hunting and drinking. On the lid, carved of the same stone, is a statue of Athulus I, lying in state. It the statue is accurate - a bit assumption - Athulus I was a big, muscled man, though the armour he is wearing obscures any details.
<br/>",
  }
);


createRoom("secondcrypt",
  {
    name:"secondcrypt",
    loc:"_outercastle",
    inherit:"editor_room",
    usedefaultprefix:false,
    alias:"Second Crypt",
    roomtype:"Cellar",
    west:new Exit("cellars"),
    east:new Exit("innercrypt"),
    desc:"This looks to be a later addition to the crypt, dug out when the shelves were full.{once: You wonder who got that job.}
Unlike the other room, the walls are plain, and the coffins are just piled up haphazardly on either side. There is a small passage way to the west.",
  }
);


createItem("coffins",
  OPENABLE
  {
    name:"coffins",
    loc:"secondcrypt",
    inherit:"openable",
,
    takemsg:"You do not need to take a coffin with you.",
    feature_container:"",
    open:"",
    alias:"coffin",
    listalias:"Coffin",
    scenery:"",
    openscript:[undefined],
    examine:"The coffins are made of a very pale stone. There are pictures carved into the sides; various courtly scenes. These coffins seem older than the ones in the first room.{once: Presumably the older ones are moved in here to make room for the newer coffins in the other room.}",
  }
);


createRoom("_nowhere",
  {
    name:"_nowhere",
    inherit:"editor_room",
  }
);


createItem("reklindraa",
  {
    name:"reklindraa",
    loc:"_nowhere",
    inherit:"editor_object",
    alias:"Reklindraa",
    examine:"A clear, colourless liquid, this will stop the imbiber from getting pregnant for around ten days.",
  }
);