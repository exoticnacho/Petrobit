#![cfg(test)]

use super::{TamagotchiContract, TamagotchiContractClient, MAX_STAT};
use soroban_sdk::{
    testutils::{Address as _, Ledger, LedgerInfo},
    Address, Env, String,
};

fn create_tamagotchi_contract(env: &Env) -> TamagotchiContractClient<'_> {
    TamagotchiContractClient::new(env, &env.register(TamagotchiContract, ()))
}

fn advance_ledger(env: &Env, seconds: u64) {
    env.ledger().set(LedgerInfo {
        timestamp: env.ledger().timestamp() + seconds,
        protocol_version: env.ledger().protocol_version(),
        sequence_number: env.ledger().sequence(),
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 1,
        min_persistent_entry_ttl: 1,
        max_entry_ttl: u32::MAX,
    });
}

#[test]
fn test_create_pet() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    let name = String::from_str(&env, "Pixel");

    let pet = client.create(&owner, &name);

    assert_eq!(pet.owner, owner);
    assert_eq!(pet.name, name);
    assert_eq!(pet.is_alive, true);
    assert_eq!(pet.hunger, MAX_STAT);
    assert_eq!(pet.happiness, MAX_STAT);
    assert_eq!(pet.energy, MAX_STAT);
    assert_eq!(pet.has_glasses, false);

    let coins = client.get_coins(&owner);
    assert_eq!(coins, 0);
}

#[test]
#[should_panic(expected = "Pet already exists for this owner")]
fn test_create_pet_already_exists() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    let name = String::from_str(&env, "Pixel");

    client.create(&owner, &name);
    client.create(&owner, &name); // Should panic here
}

#[test]
fn test_feed() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);

    client.create(&owner, &String::from_str(&env, "Giga"));

    // Let's simulate decay first.
    advance_ledger(&env, 60 * 5); // 5 minutes
    client.feed(&owner);
    let pet = client.get_pet(&owner);

    // Initial: 100. Decay over 5 mins (5 periods): 100 - (5*2) = 90.
    // Feed: 90 + 30 = 120, capped at 100.
    assert_eq!(pet.hunger, MAX_STAT);
}

#[test]
fn test_play() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Player"));

    advance_ledger(&env, 60 * 10); // 10 minutes
                                   // Initial happiness: 100. Decay: 100 - (10*1) = 90.
                                   // Initial energy: 100. No decay for energy.

    client.play(&owner);
    let pet = client.get_pet(&owner);

    // Happiness: 90 + 20 = 110, capped at 100.
    // Energy: 100 - 15 = 85.
    assert_eq!(pet.happiness, MAX_STAT);
    assert_eq!(pet.energy, 85);
}

#[test]
fn test_work() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Worker"));

    client.work(&owner);
    let pet = client.get_pet(&owner);
    let coins = client.get_coins(&owner);

    // Energy: 100 - 20 = 80
    // Happiness: 100 - 10 = 90
    // Coins: 0 + 25 = 25
    assert_eq!(pet.energy, 80);
    assert_eq!(pet.happiness, 90);
    assert_eq!(coins, 25);
}

#[test]
#[should_panic(expected = "Not enough energy to work.")]
fn test_work_no_energy() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Tired"));

    // Work 5 times to drain energy
    for _ in 0..5 {
        client.work(&owner);
    }
    // Energy should be 0 now.
    let pet = client.get_pet(&owner);
    assert_eq!(pet.energy, 0);

    client.work(&owner); // Should panic
}

#[test]
fn test_sleep() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Sleepy"));

    // Work to reduce energy
    client.work(&owner); // Energy: 80
    client.work(&owner); // Energy: 60

    client.sleep(&owner);
    let pet = client.get_pet(&owner);
    // Energy: 60 + 40 = 100
    assert_eq!(pet.energy, MAX_STAT);
}

#[test]
fn test_stat_decay_and_death() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Doomed"));

    // Hunger decays by 2 every 60s. It needs 50 periods to reach 0.
    // 50 periods * 60s/period = 3000 seconds.
    advance_ledger(&env, 3000);

    // Calling any function will trigger the decay calculation.
    let pet = client.get_pet(&owner);
    assert_eq!(pet.is_alive, false);
    assert_eq!(pet.hunger, 0);
}

#[test]
#[should_panic(expected = "Your pet is no longer with us.")]
fn test_action_on_dead_pet() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Ghost"));

    // Advance time enough to kill the pet
    advance_ledger(&env, 3000);

    // This call will update the state to dead
    let pet = client.get_pet(&owner);
    assert_eq!(pet.is_alive, false);

    // This should panic
    client.feed(&owner);
}

#[test]
fn test_mint_glasses() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Cool"));

    // Work to earn coins (need at least 50 for glasses)
    client.work(&owner); // 25 coins
    client.work(&owner); // 50 coins

    client.mint_glasses(&owner);

    let pet = client.get_pet(&owner);
    let coins = client.get_coins(&owner);

    assert_eq!(pet.has_glasses, true);
    assert_eq!(coins, 0);
}

#[test]
#[should_panic(expected = "Not enough coins to mint glasses.")]
fn test_mint_glasses_no_coins() {
    let env = Env::default();
    env.mock_all_auths();
    let client = create_tamagotchi_contract(&env);
    let owner = Address::generate(&env);
    client.create(&owner, &String::from_str(&env, "Broke"));

    // Try to mint glasses without earning any coins
    client.mint_glasses(&owner); // Should panic
}