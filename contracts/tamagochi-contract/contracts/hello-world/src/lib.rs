#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

// Define the maximum value for stats
const MAX_STAT: u32 = 100;

// XP Configuration
const BASE_XP_REQUIRED: u64 = 100;
const XP_PER_FEED: u64 = 20;
const XP_PER_PLAY: u64 = 30;
const XP_PER_WORK: u64 = 25;
const XP_PER_SLEEP: u64 = 15;
const XP_PER_EXERCISE: u64 = 35; // New action

// Accessory Bitmasks
const ACCESSORY_GLASSES: u32 = 0b0001;
const COINS_FOR_GLASSES: i128 = 50;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Pet {
    pub owner: Address,
    pub name: String,
    pub birthdate: u64,
    pub last_updated: u64,
    pub is_alive: bool,

    // Stats
    pub hunger: u32,
    pub happiness: u32,
    pub energy: u32,

    // New Leveling Fields
    pub level: u32,
    pub xp: u64,
    pub next_level_xp: u64,

    // Species ID (0, 1, 2, etc.)
    pub species_id: u32,

    // Customization (Bitmask)
    pub accessories: u32,
}

#[contracttype]
pub enum DataKey {
    Pet(Address),
    Coins(Address),
}

// Helper function to apply time-based stat decay before any action
// Returns the updated Pet struct
fn try_decay_stats(env: &Env, owner: &Address) -> Pet {
    // Check if pet exists
    let mut pet: Pet = env.storage()
        .instance()
        .get(&DataKey::Pet(owner.clone()))
        .expect("Pet not found");

    if !pet.is_alive {
        return pet;
    }

    let current_time = env.ledger().timestamp();
    let time_elapsed = current_time.saturating_sub(pet.last_updated);

    // Stats decay every 60 seconds
    let decay_periods = time_elapsed / 60;

    if decay_periods > 0 {
        // Level bonus: Reduce decay rate by 1% per level (L1: 100%, L2: 99%, L10: 91%)
        // Capping reduction at L20 (20% reduction)
        let level_multiplier = 100u32.saturating_sub(pet.level.saturating_sub(1).min(20)); 

        // Hunger decays by 2 points per period
        pet.hunger = pet.hunger.saturating_sub(
            ((decay_periods as u32) * 2 * level_multiplier / 100).max(1) 
        );
        
        // Happiness decays by 1 point per period
        pet.happiness = pet.happiness.saturating_sub(
            ((decay_periods as u32) * 1 * level_multiplier / 100).max(1)
        );

        pet.last_updated = current_time;

        // Check for death
        if pet.hunger == 0 || pet.happiness == 0 {
            pet.is_alive = false;
        }

        env.storage().instance().set(&DataKey::Pet(owner.clone()), &pet);
    }
    
    pet
}

#[contract]
pub struct TamagotchiContract;

#[contractimpl]
impl TamagotchiContract {
    // Helper function to calculate XP needed for next level
    fn calculate_next_level_xp(level: u32) -> u64 {
        BASE_XP_REQUIRED.checked_mul(level as u64).unwrap_or(u64::MAX)
    }

    pub fn create(env: Env, owner: Address, name: String) -> Pet {
        owner.require_auth();

        // Check if pet already exists and alive
        if env.storage().instance().has(&DataKey::Pet(owner.clone())) {
            let existing_pet: Pet = env.storage().instance().get(&DataKey::Pet(owner.clone())).unwrap();
            if existing_pet.is_alive {
                panic!("Pet already exists for this owner");
            }
        }

        let current_time = env.ledger().timestamp();
        let species_id = (current_time % 3) as u32; // simple pseudo-random species

        let pet = Pet {
            owner: owner.clone(),
            name: name.clone(),
            birthdate: current_time,
            last_updated: current_time,
            is_alive: true,
            hunger: MAX_STAT,
            happiness: MAX_STAT,
            energy: MAX_STAT,
            level: 1,
            xp: 0,
            next_level_xp: Self::calculate_next_level_xp(1),
            species_id,
            accessories: 0,
        };

        env.storage().instance().set(&DataKey::Pet(owner.clone()), &pet);
        env.storage().instance().set(&DataKey::Coins(owner.clone()), &0i128);

        pet
    }

    pub fn get_pet(env: Env, owner: Address) -> Pet {
        let pet: Pet = env.storage().instance().get(&DataKey::Pet(owner.clone())).expect("Pet not found");
        pet
    }

    pub fn get_coins(env: Env, owner: Address) -> i128 {
        env.storage().instance().get(&DataKey::Coins(owner)).unwrap_or(0)
    }

    pub fn feed(env: Env, owner: Address) -> Pet {
        owner.require_auth();

        let mut pet = try_decay_stats(&env, &owner);
        if !pet.is_alive {
            panic!("Cannot perform action on a dead pet.");
        }

        pet.hunger = pet.hunger.saturating_add(30).min(MAX_STAT);
        pet.xp = pet.xp.saturating_add(XP_PER_FEED);

        // Level up check
        while pet.xp >= pet.next_level_xp {
            pet.xp = pet.xp.saturating_sub(pet.next_level_xp);
            pet.level = pet.level.saturating_add(1);
            pet.next_level_xp = Self::calculate_next_level_xp(pet.level);
        }

        pet.last_updated = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Pet(owner), &pet);
        pet
    }

    pub fn play(env: Env, owner: Address) -> Pet {
        owner.require_auth();

        let mut pet = try_decay_stats(&env, &owner);
        if !pet.is_alive {
            panic!("Cannot perform action on a dead pet.");
        }

        if pet.energy < 15 {
            panic!("Not enough energy to play.");
        }

        pet.happiness = pet.happiness.saturating_add(20).min(MAX_STAT);
        pet.energy = pet.energy.saturating_sub(15);
        pet.xp = pet.xp.saturating_add(XP_PER_PLAY);

        // Level up check
        while pet.xp >= pet.next_level_xp {
            pet.xp = pet.xp.saturating_sub(pet.next_level_xp);
            pet.level = pet.level.saturating_add(1);
            pet.next_level_xp = Self::calculate_next_level_xp(pet.level);
        }

        pet.last_updated = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Pet(owner), &pet);
        pet
    }

    pub fn sleep(env: Env, owner: Address) -> Pet {
        owner.require_auth();

        let mut pet = try_decay_stats(&env, &owner);
        if !pet.is_alive {
            panic!("Cannot perform action on a dead pet.");
        }

        pet.energy = pet.energy.saturating_add(40).min(MAX_STAT);
        pet.xp = pet.xp.saturating_add(XP_PER_SLEEP);

        // Level up check
        while pet.xp >= pet.next_level_xp {
            pet.xp = pet.xp.saturating_sub(pet.next_level_xp);
            pet.level = pet.level.saturating_add(1);
            pet.next_level_xp = Self::calculate_next_level_xp(pet.level);
        }

        pet.last_updated = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Pet(owner), &pet);
        pet
    }

    pub fn work(env: Env, owner: Address) -> Pet {
        owner.require_auth();

        let mut pet = try_decay_stats(&env, &owner);
        if !pet.is_alive {
            panic!("Cannot perform action on a dead pet.");
        }

        if pet.energy < 20 {
            panic!("Not enough energy to work.");
        }

        pet.energy = pet.energy.saturating_sub(20);
        pet.happiness = pet.happiness.saturating_sub(10);
        pet.xp = pet.xp.saturating_add(XP_PER_WORK);

        // Update coins (+25)
        let coins_key = DataKey::Coins(owner.clone());
        let current_coins: i128 = env.storage().instance().get(&coins_key).unwrap_or(0);
        let new_coins = current_coins.checked_add(25).unwrap_or(i128::MAX);
        env.storage().instance().set(&coins_key, &new_coins);

        // Level up check
        while pet.xp >= pet.next_level_xp {
            pet.xp = pet.xp.saturating_sub(pet.next_level_xp);
            pet.level = pet.level.saturating_add(1);
            pet.next_level_xp = Self::calculate_next_level_xp(pet.level);
        }

        pet.last_updated = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Pet(owner), &pet);
        pet
    }

    pub fn exercise(env: Env, owner: Address) -> Pet {
        owner.require_auth();
        
        let mut pet = try_decay_stats(&env, &owner);
        if !pet.is_alive {
            panic!("Cannot perform action on a dead pet.");
        }

        const ENERGY_COST: u32 = 25;
        if pet.energy < ENERGY_COST {
            panic!("Not enough energy to exercise.");
        }
        
        pet.energy = pet.energy.saturating_sub(ENERGY_COST);
        pet.happiness = pet.happiness.saturating_add(25).min(MAX_STAT);

        // Update coins (+10)
        let coins_key = DataKey::Coins(owner.clone());
        let current_coins: i128 = env.storage().instance().get(&coins_key).unwrap_or(0);
        let new_coins = current_coins.checked_add(10).unwrap_or(i128::MAX);
        env.storage().instance().set(&coins_key, &new_coins);

        pet.xp = pet.xp.saturating_add(XP_PER_EXERCISE);

        while pet.xp >= pet.next_level_xp {
            pet.xp = pet.xp.saturating_sub(pet.next_level_xp);
            pet.level = pet.level.saturating_add(1);
            pet.next_level_xp = Self::calculate_next_level_xp(pet.level);
        }

        pet.last_updated = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Pet(owner), &pet);
        pet
    }

    pub fn mint_glasses(env: Env, owner: Address) -> Pet {
        owner.require_auth();

        let mut pet = try_decay_stats(&env, &owner);
        if !pet.is_alive {
            panic!("Your pet is no longer with us.");
        }

        if (pet.accessories & ACCESSORY_GLASSES) != 0 {
            panic!("Glasses already owned.");
        }

        // Check coins
        let coins_key = DataKey::Coins(owner.clone());
        let mut coins: i128 = env.storage().instance().get(&coins_key).unwrap_or(0);
        if coins < COINS_FOR_GLASSES {
            panic!("Not enough coins to mint glasses.");
        }

        coins -= COINS_FOR_GLASSES;
        pet.accessories |= ACCESSORY_GLASSES;

        // Level up check (optional, keep consistent)
        while pet.xp >= pet.next_level_xp {
            pet.xp = pet.xp.saturating_sub(pet.next_level_xp);
            pet.level = pet.level.saturating_add(1);
            pet.next_level_xp = Self::calculate_next_level_xp(pet.level);
        }

        pet.last_updated = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Pet(owner.clone()), &pet);
        env.storage().instance().set(&coins_key, &coins);

        pet
    }
}
