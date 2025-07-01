export interface ArchidektDeck {
    id:               number;
    name:             string;
    createdAt:        Date;
    updatedAt:        Date;
    deckFormat:       number;
    edhBracket:       null;
    game:             null;
    description:      string;
    viewCount:        number;
    featured:         string;
    customFeatured:   string;
    private:          boolean;
    unlisted:         boolean;
    theorycrafted:    boolean;
    points:           number;
    userInput:        number;
    owner:            Owner;
    commentRoot:      number;
    editors:          null;
    parentFolder:     number;
    bookmarked:       boolean;
    categories:       Category[];
    deckTags:         any[];
    playgroupDeckUrl: null;
    cardPackage:      null;
    cards:            CardElement[];
}

interface CardElement {
    id:                number;
    categories:        string[];
    companion:         boolean;
    flippedDefault:    boolean;
    label:             Label;
    modifier:          Modifier;
    quantity:          number;
    customCmc:         null;
    removedCategories: null;
    createdAt:         Date;
    updatedAt:         Date;
    deletedAt:         null;
    card:              CardCard;
}

interface CardCard {
    id:                number;
    artist:            string;
    tcgProductId:      number;
    ckFoilId:          number | null;
    ckNormalId:        number | null;
    cmEd:              null | string;
    scgSku:            null | string;
    scgFoilSku:        null | string;
    collectorNumber:   string;
    multiverseid:      number;
    mtgoFoilId:        number;
    mtgoNormalId:      number;
    uid:               string;
    displayName:       null | string;
    edition:           Edition;
    flavor:            string;
    games:             any[];
    options:           Modifier[];
    scryfallImageHash: null | string;
    oracleCard:        OracleCard;
    owned:             number;
    prices:            { [key: string]: number };
    rarity:            Rarity;
    globalCategories:  any[];
}

interface Edition {
    editioncode: string;
    editionname: string;
    editiondate: Date;
    editiontype: Editiontype;
    mtgoCode:    null | string;
}

enum Editiontype {
    Box = "box",
    Commander = "commander",
    Core = "core",
    DraftInnovation = "draft_innovation",
    DuelDeck = "duel_deck",
    Expansion = "expansion",
    Masterpiece = "masterpiece",
    Masters = "masters",
    Promo = "promo",
}

enum Modifier {
    Etched = "Etched",
    Foil = "Foil",
    Normal = "Normal",
}

interface OracleCard {
    id:                    number;
    cmc:                   number;
    colorIdentity:         Color[];
    colors:                Color[];
    edhrecRank:            number | null;
    faces:                 Face[];
    layout:                Layout;
    uid:                   string;
    legalities:            Legalities;
    manaCost:              string;
    manaProduction:        ManaProduction;
    name:                  string;
    power:                 string;
    salt:                  number | null;
    subTypes:              string[];
    superTypes:            SuperType[];
    text:                  string;
    tokens:                string[];
    toughness:             string;
    types:                 Type[];
    loyalty:               null | string;
    canlanderPoints:       null;
    isPDHCommander:        boolean;
    defaultCategory:       null | string;
    gameChanger:           boolean;
    extraTurns:            boolean;
    tutor:                 boolean;
    massLandDenial:        boolean;
    twoCardComboSingelton: boolean;
    twoCardComboIds:       string[];
    atomicCombos:          string[];
    potentialCombos:       string[];
}

enum Color {
    Black = "Black",
}

interface Face {
    colors:     Color[];
    flavor:     string;
    manaCost:   string;
    name:       string;
    power:      string;
    subTypes:   string[];
    superTypes: SuperType[];
    text:       string;
    toughness:  string;
    types:      Type[];
    loyalty:    null;
}

enum SuperType {
    Basic = "Basic",
    Legendary = "Legendary",
}

enum Type {
    Artifact = "Artifact",
    Creature = "Creature",
    Enchantment = "Enchantment",
    Instant = "Instant",
    Kindred = "Kindred",
    Land = "Land",
    Planeswalker = "Planeswalker",
    Sorcery = "Sorcery",
}

enum Layout {
    Normal = "normal",
    Transform = "transform",
}

interface Legalities {
    alchemy:         The1_V1;
    legacy:          The1_V1;
    oldschool:       The1_V1;
    modern:          The1_V1;
    vintage:         The1_V1;
    oathbreaker:     The1_V1;
    "1v1":           The1_V1;
    historicbrawl:   The1_V1;
    premodern:       The1_V1;
    historic:        The1_V1;
    commander:       The1_V1;
    paupercommander: The1_V1;
    gladiator:       The1_V1;
    explorer:        null;
    brawl:           The1_V1;
    penny:           The1_V1;
    pioneer:         The1_V1;
    duel:            The1_V1;
    pauper:          The1_V1;
    standard:        The1_V1;
    future:          The1_V1;
    predh:           The1_V1;
    timeless:        The1_V1;
    canlander:       The1_V1;
}

enum The1_V1 {
    Banned = "banned",
    Legal = "legal",
    NotLegal = "not_legal",
}

interface ManaProduction {
    W: number | null;
    U: number | null;
    B: number | null;
    R: number | null;
    G: number | null;
    C: number | null;
}

enum Rarity {
    Common = "common",
    Mythic = "mythic",
    Rare = "rare",
    Uncommon = "uncommon",
}

enum Label {
    DonTHaveF47373 = "Don't Have,#f47373",
    Getting2Ccce4 = "Getting,#2ccce4",
    Have37D67A = "Have,#37d67a",
    The656565 = ",#656565",
}

interface Category {
    id:              number;
    name:            string;
    isPremier:       boolean;
    includedInDeck:  boolean;
    includedInPrice: boolean;
}

interface Owner {
    id:           number;
    username:     string;
    avatar:       string;
    frame:        null;
    ckAffiliate:  string;
    tcgAffiliate: string;
    referrerEnum: null;
}
