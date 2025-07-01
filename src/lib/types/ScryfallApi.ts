export interface CardSearchResults {
    object:      string;
    total_cards: number;
    has_more:    boolean;
    data:        Datum[];
}

export interface Datum {
    object:            DatumObject;
    id:                string;
    oracle_id:         string;
    multiverse_ids:    any[];
    name:              string;
    lang:              Lang;
    released_at:       Date;
    uri:               string;
    scryfall_uri:      string;
    layout:            Layout;
    highres_image:     boolean;
    image_status:      ImageStatus;
    image_uris?:       ImageUris;
    mana_cost?:        string;
    cmc:               number;
    type_line:         string;
    oracle_text?:      string;
    power?:            string;
    toughness?:        string;
    colors?:           Color[];
    color_identity:    Color[];
    keywords:          string[];
    legalities:        Legalities;
    games:             Game[];
    reserved:          boolean;
    game_changer:      boolean;
    foil:              boolean;
    nonfoil:           boolean;
    finishes:          Finish[];
    oversized:         boolean;
    promo:             boolean;
    reprint:           boolean;
    variation:         boolean;
    set_id:            string;
    set:               string;
    set_name:          string;
    set_type:          SetType;
    set_uri:           string;
    set_search_uri:    string;
    scryfall_set_uri:  string;
    rulings_uri:       string;
    prints_search_uri: string;
    collector_number:  string;
    digital:           boolean;
    rarity:            Rarity;
    card_back_id?:     string;
    artist:            string;
    artist_ids:        string[];
    illustration_id?:  string;
    border_color:      BorderColor;
    frame:             string;
    frame_effects?:    string[];
    full_art:          boolean;
    textless:          boolean;
    booster:           boolean;
    story_spotlight:   boolean;
    promo_types?:      string[];
    prices:            { [key: string]: null | string };
    related_uris:      RelatedUris;
    purchase_uris:     PurchaseUris;
    card_faces?:       CardFace[];
    all_parts?:        AllPart[];
    tcgplayer_id?:     number;
    security_stamp?:   string;
}

export interface AllPart {
    object:    AllPartObject;
    id:        string;
    component: Component;
    name:      string;
    type_line: string;
    uri:       string;
}

export enum Component {
    ComboPiece = "combo_piece",
    Token = "token",
}

export enum AllPartObject {
    RelatedCard = "related_card",
}

export enum BorderColor {
    Black = "black",
}

export interface CardFace {
    object:          string;
    name:            string;
    mana_cost:       string;
    type_line:       string;
    oracle_text:     string;
    colors:          Color[];
    power?:          string;
    toughness?:      string;
    artist:          string;
    artist_id:       string;
    illustration_id: string;
    image_uris:      ImageUris;
}

export enum Color {
    B = "B",
    U = "U",
    W = "W",
}

export interface ImageUris {
    small:       string;
    normal:      string;
    large:       string;
    png:         string;
    art_crop:    string;
    border_crop: string;
}

export enum Finish {
    Foil = "foil",
    Nonfoil = "nonfoil",
}

export enum Game {
    Arena = "arena",
    Mtgo = "mtgo",
    Paper = "paper",
}

export enum ImageStatus {
    HighresScan = "highres_scan",
    Lowres = "lowres",
}

export enum Lang {
    En = "en",
}

export enum Layout {
    DoubleFacedToken = "double_faced_token",
    Token = "token",
}

export interface Legalities {
    standard:        Alchemy;
    future:          Alchemy;
    historic:        Alchemy;
    timeless:        Alchemy;
    gladiator:       Alchemy;
    pioneer:         Alchemy;
    modern:          Alchemy;
    legacy:          Alchemy;
    pauper:          Alchemy;
    vintage:         Alchemy;
    penny:           Alchemy;
    commander:       Alchemy;
    oathbreaker:     Alchemy;
    standardbrawl:   Alchemy;
    brawl:           Alchemy;
    alchemy:         Alchemy;
    paupercommander: Alchemy;
    duel:            Alchemy;
    oldschool:       Alchemy;
    premodern:       Alchemy;
    predh:           Alchemy;
}

export enum Alchemy {
    NotLegal = "not_legal",
}

export enum DatumObject {
    Card = "card",
}

export interface PurchaseUris {
    tcgplayer:   string;
    cardmarket:  string;
    cardhoarder: string;
}

export enum Rarity {
    Common = "common",
}

export interface RelatedUris {
    tcgplayer_infinite_articles: string;
    tcgplayer_infinite_decks:    string;
    edhrec:                      string;
}

export enum SetType {
    Arsenal = "arsenal",
    Promo = "promo",
    Token = "token",
}
