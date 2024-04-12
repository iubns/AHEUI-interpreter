use storage::Storage;

pub struct Position {
    pub x: i32,
    pub y: i32,
}

pub struct Processor {
    storage: Storage,
    current_position: Position
}

impl Processor {
    pub fn new () -> Processor {
        Processor {
            storage: Default::default(),
            current_position: Position {
                x: 0, y,0
            }
        }
    }
}