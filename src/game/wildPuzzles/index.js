// Environment-Mapped Wild Pokemon Tactical Quiz Encounters
//
// Each puzzle lives in its own file (one per encounter) so a single puzzle can be reviewed,
// edited, or audited in isolation instead of scrolling a giant shared array. Run
// `npm run audit:puzzles` after adding or editing a puzzle here — it verifies the FEN is
// legal, the solutionMove(s) are actually playable, and that the prompt/coachHint text agrees
// with what the move(s) really do (see scripts/audit-wild-puzzles.mjs).
//
// A puzzle is either a single move (`solutionMove`) or a full alternating sequence
// (`solutionMoves`: player, forced opponent reply, player, ...; paired with `stepHints`,
// one hint per player move) for genuine multi-move tactics like fork-then-capture or
// mate-in-2. See WildPuzzleScreen.jsx for how the sequence is played out.
//
// The bulk of this file's entries were content-filled by scripts/generate-wild-puzzles.mjs
// (>=30 validated puzzles per region) so a "tall grass" zone doesn't repeat the same 1-2
// Pokemon on every step. Re-run that generator (not by hand) if a region needs more variety.
//
// `weight` = relative rarity within a region (higher = more common), used by
// pickWeightedWildPuzzle(). `difficulty` is a display label ('easy'|'medium'|'hard').

import WildPikachu from './wild_pikachu.js';
import WildTreecko from './wild_treecko.js';
import WildCharmander from './wild_charmander.js';
import WildSlugma from './wild_slugma.js';
import WildSquirtle from './wild_squirtle.js';
import WildLotad from './wild_lotad.js';
import WildMagnemite from './wild_magnemite.js';
import WildSnorunt from './wild_snorunt.js';
import WildEevee from './wild_eevee.js';
import WildPetalburgCaterpie0 from './wild_petalburg_caterpie_0.js';
import WildPetalburgMetapod1 from './wild_petalburg_metapod_1.js';
import WildPetalburgWeedle2 from './wild_petalburg_weedle_2.js';
import WildPetalburgKakuna3 from './wild_petalburg_kakuna_3.js';
import WildPetalburgBeedrill4 from './wild_petalburg_beedrill_4.js';
import WildPetalburgOddish5 from './wild_petalburg_oddish_5.js';
import WildPetalburgParas6 from './wild_petalburg_paras_6.js';
import WildPetalburgVenonat7 from './wild_petalburg_venonat_7.js';
import WildPetalburgBellsprout8 from './wild_petalburg_bellsprout_8.js';
import WildPetalburgScyther9 from './wild_petalburg_scyther_9.js';
import WildPetalburgPineco10 from './wild_petalburg_pineco_10.js';
import WildPetalburgSunkern11 from './wild_petalburg_sunkern_11.js';
import WildPetalburgHoppip12 from './wild_petalburg_hoppip_12.js';
import WildPetalburgYanma13 from './wild_petalburg_yanma_13.js';
import WildPetalburgWurmple14 from './wild_petalburg_wurmple_14.js';
import WildPetalburgSilcoon15 from './wild_petalburg_silcoon_15.js';
import WildPetalburgCascoon16 from './wild_petalburg_cascoon_16.js';
import WildPetalburgSeedot17 from './wild_petalburg_seedot_17.js';
import WildPetalburgSurskit18 from './wild_petalburg_surskit_18.js';
import WildPetalburgShroomish19 from './wild_petalburg_shroomish_19.js';
import WildPetalburgNincada20 from './wild_petalburg_nincada_20.js';
import WildPetalburgVolbeat21 from './wild_petalburg_volbeat_21.js';
import WildPetalburgIllumise22 from './wild_petalburg_illumise_22.js';
import WildPetalburgRoselia23 from './wild_petalburg_roselia_23.js';
import WildPetalburgCaterpie124 from './wild_petalburg_caterpie_1_24.js';
import WildPetalburgMetapod125 from './wild_petalburg_metapod_1_25.js';
import WildPetalburgWeedle126 from './wild_petalburg_weedle_1_26.js';
import WildPetalburgKakuna127 from './wild_petalburg_kakuna_1_27.js';
import WildPetalburgBeedrill128 from './wild_petalburg_beedrill_1_28.js';
import WildPetalburgOddish129 from './wild_petalburg_oddish_1_29.js';
import WildPetalburgParas130 from './wild_petalburg_paras_1_30.js';
import WildPetalburgVenonat131 from './wild_petalburg_venonat_1_31.js';
import WildPetalburgBellsprout132 from './wild_petalburg_bellsprout_1_32.js';
import WildPetalburgScyther133 from './wild_petalburg_scyther_1_33.js';
import WildPetalburgPineco134 from './wild_petalburg_pineco_1_34.js';
import WildPetalburgSunkern135 from './wild_petalburg_sunkern_1_35.js';
import WildPetalburgHoppip136 from './wild_petalburg_hoppip_1_36.js';
import WildPetalburgYanma137 from './wild_petalburg_yanma_1_37.js';
import WildPetalburgWurmple138 from './wild_petalburg_wurmple_1_38.js';
import WildPetalburgSilcoon139 from './wild_petalburg_silcoon_1_39.js';
import WildPetalburgCascoon140 from './wild_petalburg_cascoon_1_40.js';
import WildPetalburgSeedot141 from './wild_petalburg_seedot_1_41.js';
import WildVolcanoVulpix0 from './wild_volcano_vulpix_0.js';
import WildVolcanoGrowlithe1 from './wild_volcano_growlithe_1.js';
import WildVolcanoPonyta2 from './wild_volcano_ponyta_2.js';
import WildVolcanoMagmar3 from './wild_volcano_magmar_3.js';
import WildVolcanoCharmeleon4 from './wild_volcano_charmeleon_4.js';
import WildVolcanoHoundour5 from './wild_volcano_houndour_5.js';
import WildVolcanoNumel6 from './wild_volcano_numel_6.js';
import WildVolcanoTorkoal7 from './wild_volcano_torkoal_7.js';
import WildVolcanoMagby8 from './wild_volcano_magby_8.js';
import WildVolcanoTorchic9 from './wild_volcano_torchic_9.js';
import WildVolcanoCombusken10 from './wild_volcano_combusken_10.js';
import WildVolcanoCamerupt11 from './wild_volcano_camerupt_11.js';
import WildVolcanoVulpix112 from './wild_volcano_vulpix_1_12.js';
import WildVolcanoGrowlithe113 from './wild_volcano_growlithe_1_13.js';
import WildVolcanoPonyta114 from './wild_volcano_ponyta_1_14.js';
import WildVolcanoMagmar115 from './wild_volcano_magmar_1_15.js';
import WildVolcanoCharmeleon116 from './wild_volcano_charmeleon_1_16.js';
import WildVolcanoHoundour117 from './wild_volcano_houndour_1_17.js';
import WildVolcanoNumel118 from './wild_volcano_numel_1_18.js';
import WildVolcanoTorkoal119 from './wild_volcano_torkoal_1_19.js';
import WildVolcanoMagby120 from './wild_volcano_magby_1_20.js';
import WildVolcanoTorchic121 from './wild_volcano_torchic_1_21.js';
import WildVolcanoCombusken122 from './wild_volcano_combusken_1_22.js';
import WildVolcanoCamerupt123 from './wild_volcano_camerupt_1_23.js';
import WildVolcanoVulpix224 from './wild_volcano_vulpix_2_24.js';
import WildVolcanoGrowlithe225 from './wild_volcano_growlithe_2_25.js';
import WildVolcanoPonyta226 from './wild_volcano_ponyta_2_26.js';
import WildVolcanoMagmar227 from './wild_volcano_magmar_2_27.js';
import WildVolcanoCharmeleon228 from './wild_volcano_charmeleon_2_28.js';
import WildVolcanoHoundour229 from './wild_volcano_houndour_2_29.js';
import WildVolcanoNumel230 from './wild_volcano_numel_2_30.js';
import WildVolcanoTorkoal231 from './wild_volcano_torkoal_2_31.js';
import WildVolcanoMagby232 from './wild_volcano_magby_2_32.js';
import WildVolcanoTorchic233 from './wild_volcano_torchic_2_33.js';
import WildVolcanoCombusken234 from './wild_volcano_combusken_2_34.js';
import WildVolcanoCamerupt235 from './wild_volcano_camerupt_2_35.js';
import WildVolcanoVulpix336 from './wild_volcano_vulpix_3_36.js';
import WildVolcanoGrowlithe337 from './wild_volcano_growlithe_3_37.js';
import WildVolcanoPonyta338 from './wild_volcano_ponyta_3_38.js';
import WildVolcanoMagmar339 from './wild_volcano_magmar_3_39.js';
import WildVolcanoCharmeleon340 from './wild_volcano_charmeleon_3_40.js';
import WildVolcanoHoundour341 from './wild_volcano_houndour_3_41.js';
import WildClassicRattata0 from './wild_classic_rattata_0.js';
import WildClassicPidgey1 from './wild_classic_pidgey_1.js';
import WildClassicMeowth2 from './wild_classic_meowth_2.js';
import WildClassicPsyduck3 from './wild_classic_psyduck_3.js';
import WildClassicMachop4 from './wild_classic_machop_4.js';
import WildClassicGeodude5 from './wild_classic_geodude_5.js';
import WildClassicAbra6 from './wild_classic_abra_6.js';
import WildClassicMagikarp7 from './wild_classic_magikarp_7.js';
import WildClassicEkans8 from './wild_classic_ekans_8.js';
import WildClassicSandshrew9 from './wild_classic_sandshrew_9.js';
import WildClassicJigglypuff10 from './wild_classic_jigglypuff_10.js';
import WildClassicClefairy11 from './wild_classic_clefairy_11.js';
import WildClassicDitto12 from './wild_classic_ditto_12.js';
import WildClassicSnorlax13 from './wild_classic_snorlax_13.js';
import WildClassicBulbasaur14 from './wild_classic_bulbasaur_14.js';
import WildClassicPidgeotto15 from './wild_classic_pidgeotto_15.js';
import WildClassicSpearow16 from './wild_classic_spearow_16.js';
import WildClassicNidoran17 from './wild_classic_nidoran_17.js';
import WildClassicRattata118 from './wild_classic_rattata_1_18.js';
import WildClassicPidgey119 from './wild_classic_pidgey_1_19.js';
import WildClassicMeowth120 from './wild_classic_meowth_1_20.js';
import WildClassicPsyduck121 from './wild_classic_psyduck_1_21.js';
import WildClassicMachop122 from './wild_classic_machop_1_22.js';
import WildClassicGeodude123 from './wild_classic_geodude_1_23.js';
import WildClassicAbra124 from './wild_classic_abra_1_24.js';
import WildClassicMagikarp125 from './wild_classic_magikarp_1_25.js';
import WildClassicEkans126 from './wild_classic_ekans_1_26.js';
import WildClassicSandshrew127 from './wild_classic_sandshrew_1_27.js';
import WildClassicJigglypuff128 from './wild_classic_jigglypuff_1_28.js';
import WildClassicClefairy129 from './wild_classic_clefairy_1_29.js';
import WildClassicDitto130 from './wild_classic_ditto_1_30.js';
import WildClassicSnorlax131 from './wild_classic_snorlax_1_31.js';
import WildClassicBulbasaur132 from './wild_classic_bulbasaur_1_32.js';
import WildClassicPidgeotto133 from './wild_classic_pidgeotto_1_33.js';
import WildClassicSpearow134 from './wild_classic_spearow_1_34.js';
import WildClassicNidoran135 from './wild_classic_nidoran_1_35.js';
import WildClassicRattata236 from './wild_classic_rattata_2_36.js';
import WildClassicPidgey237 from './wild_classic_pidgey_2_37.js';
import WildClassicMeowth238 from './wild_classic_meowth_2_38.js';
import WildClassicPsyduck239 from './wild_classic_psyduck_2_39.js';
import WildClassicMachop240 from './wild_classic_machop_2_40.js';
import WildClassicGeodude241 from './wild_classic_geodude_2_41.js';
import WildSootopolisPoliwag0 from './wild_sootopolis_poliwag_0.js';
import WildSootopolisTentacool1 from './wild_sootopolis_tentacool_1.js';
import WildSootopolisHorsea2 from './wild_sootopolis_horsea_2.js';
import WildSootopolisGoldeen3 from './wild_sootopolis_goldeen_3.js';
import WildSootopolisStaryu4 from './wild_sootopolis_staryu_4.js';
import WildSootopolisWooper5 from './wild_sootopolis_wooper_5.js';
import WildSootopolisMarill6 from './wild_sootopolis_marill_6.js';
import WildSootopolisCorsola7 from './wild_sootopolis_corsola_7.js';
import WildSootopolisChinchou8 from './wild_sootopolis_chinchou_8.js';
import WildSootopolisQwilfish9 from './wild_sootopolis_qwilfish_9.js';
import WildSootopolisMudkip10 from './wild_sootopolis_mudkip_10.js';
import WildSootopolisWingull11 from './wild_sootopolis_wingull_11.js';
import WildSootopolisCarvanha12 from './wild_sootopolis_carvanha_12.js';
import WildSootopolisWailmer13 from './wild_sootopolis_wailmer_13.js';
import WildSootopolisBarboach14 from './wild_sootopolis_barboach_14.js';
import WildSootopolisClamperl15 from './wild_sootopolis_clamperl_15.js';
import WildSootopolisPoliwag116 from './wild_sootopolis_poliwag_1_16.js';
import WildSootopolisTentacool117 from './wild_sootopolis_tentacool_1_17.js';
import WildSootopolisHorsea118 from './wild_sootopolis_horsea_1_18.js';
import WildSootopolisGoldeen119 from './wild_sootopolis_goldeen_1_19.js';
import WildSootopolisStaryu120 from './wild_sootopolis_staryu_1_20.js';
import WildSootopolisWooper121 from './wild_sootopolis_wooper_1_21.js';
import WildSootopolisMarill122 from './wild_sootopolis_marill_1_22.js';
import WildSootopolisCorsola123 from './wild_sootopolis_corsola_1_23.js';
import WildSootopolisChinchou124 from './wild_sootopolis_chinchou_1_24.js';
import WildSootopolisQwilfish125 from './wild_sootopolis_qwilfish_1_25.js';
import WildSootopolisMudkip126 from './wild_sootopolis_mudkip_1_26.js';
import WildSootopolisWingull127 from './wild_sootopolis_wingull_1_27.js';
import WildSootopolisCarvanha128 from './wild_sootopolis_carvanha_1_28.js';
import WildSootopolisWailmer129 from './wild_sootopolis_wailmer_1_29.js';
import WildSootopolisBarboach130 from './wild_sootopolis_barboach_1_30.js';
import WildSootopolisClamperl131 from './wild_sootopolis_clamperl_1_31.js';
import WildSootopolisPoliwag232 from './wild_sootopolis_poliwag_2_32.js';
import WildSootopolisTentacool233 from './wild_sootopolis_tentacool_2_33.js';
import WildSootopolisHorsea234 from './wild_sootopolis_horsea_2_34.js';
import WildSootopolisGoldeen235 from './wild_sootopolis_goldeen_2_35.js';
import WildSootopolisStaryu236 from './wild_sootopolis_staryu_2_36.js';
import WildSootopolisWooper237 from './wild_sootopolis_wooper_2_37.js';
import WildSootopolisMarill238 from './wild_sootopolis_marill_2_38.js';
import WildSootopolisCorsola239 from './wild_sootopolis_corsola_2_39.js';
import WildSootopolisChinchou240 from './wild_sootopolis_chinchou_2_40.js';
import WildSootopolisQwilfish241 from './wild_sootopolis_qwilfish_2_41.js';
import WildMauvilleVoltorb0 from './wild_mauville_voltorb_0.js';
import WildMauvilleElectrike1 from './wild_mauville_electrike_1.js';
import WildMauvillePlusle2 from './wild_mauville_plusle_2.js';
import WildMauvilleMinun3 from './wild_mauville_minun_3.js';
import WildMauvillePichu4 from './wild_mauville_pichu_4.js';
import WildMauvilleElekid5 from './wild_mauville_elekid_5.js';
import WildMauvilleMagneton6 from './wild_mauville_magneton_6.js';
import WildMauvilleSkarmory7 from './wild_mauville_skarmory_7.js';
import WildMauvilleAron8 from './wild_mauville_aron_8.js';
import WildMauvilleMareep9 from './wild_mauville_mareep_9.js';
import WildMauvilleFlaaffy10 from './wild_mauville_flaaffy_10.js';
import WildMauvilleVoltorb111 from './wild_mauville_voltorb_1_11.js';
import WildMauvilleElectrike112 from './wild_mauville_electrike_1_12.js';
import WildMauvillePlusle113 from './wild_mauville_plusle_1_13.js';
import WildMauvilleMinun114 from './wild_mauville_minun_1_14.js';
import WildMauvillePichu115 from './wild_mauville_pichu_1_15.js';
import WildMauvilleElekid116 from './wild_mauville_elekid_1_16.js';
import WildMauvilleMagneton117 from './wild_mauville_magneton_1_17.js';
import WildMauvilleSkarmory118 from './wild_mauville_skarmory_1_18.js';
import WildMauvilleAron119 from './wild_mauville_aron_1_19.js';
import WildMauvilleMareep120 from './wild_mauville_mareep_1_20.js';
import WildMauvilleFlaaffy121 from './wild_mauville_flaaffy_1_21.js';
import WildMauvilleVoltorb222 from './wild_mauville_voltorb_2_22.js';
import WildMauvilleElectrike223 from './wild_mauville_electrike_2_23.js';
import WildMauvillePlusle224 from './wild_mauville_plusle_2_24.js';
import WildMauvilleMinun225 from './wild_mauville_minun_2_25.js';
import WildMauvillePichu226 from './wild_mauville_pichu_2_26.js';
import WildMauvilleElekid227 from './wild_mauville_elekid_2_27.js';
import WildMauvilleMagneton228 from './wild_mauville_magneton_2_28.js';
import WildMauvilleSkarmory229 from './wild_mauville_skarmory_2_29.js';
import WildMauvilleAron230 from './wild_mauville_aron_2_30.js';
import WildMauvilleMareep231 from './wild_mauville_mareep_2_31.js';
import WildMauvilleFlaaffy232 from './wild_mauville_flaaffy_2_32.js';
import WildMauvilleVoltorb333 from './wild_mauville_voltorb_3_33.js';
import WildMauvilleElectrike334 from './wild_mauville_electrike_3_34.js';
import WildMauvillePlusle335 from './wild_mauville_plusle_3_35.js';
import WildMauvilleMinun336 from './wild_mauville_minun_3_36.js';
import WildMauvillePichu337 from './wild_mauville_pichu_3_37.js';
import WildMauvilleElekid338 from './wild_mauville_elekid_3_38.js';
import WildMauvilleMagneton339 from './wild_mauville_magneton_3_39.js';
import WildMauvilleSkarmory340 from './wild_mauville_skarmory_3_40.js';
import WildMauvilleAron341 from './wild_mauville_aron_3_41.js';
import WildIceSpheal0 from './wild_ice_spheal_0.js';
import WildIceSwinub1 from './wild_ice_swinub_1.js';
import WildIceSneasel2 from './wild_ice_sneasel_2.js';
import WildIceDelibird3 from './wild_ice_delibird_3.js';
import WildIceSmoochum4 from './wild_ice_smoochum_4.js';
import WildIceDewgong5 from './wild_ice_dewgong_5.js';
import WildIceSeel6 from './wild_ice_seel_6.js';
import WildIceJynx7 from './wild_ice_jynx_7.js';
import WildIcePiloswine8 from './wild_ice_piloswine_8.js';
import WildIceGlalie9 from './wild_ice_glalie_9.js';
import WildIceLapras10 from './wild_ice_lapras_10.js';
import WildIceCloyster11 from './wild_ice_cloyster_11.js';
import WildIceSpheal112 from './wild_ice_spheal_1_12.js';
import WildIceSwinub113 from './wild_ice_swinub_1_13.js';
import WildIceSneasel114 from './wild_ice_sneasel_1_14.js';
import WildIceDelibird115 from './wild_ice_delibird_1_15.js';
import WildIceSmoochum116 from './wild_ice_smoochum_1_16.js';
import WildIceDewgong117 from './wild_ice_dewgong_1_17.js';
import WildIceSeel118 from './wild_ice_seel_1_18.js';
import WildIceJynx119 from './wild_ice_jynx_1_19.js';
import WildIcePiloswine120 from './wild_ice_piloswine_1_20.js';
import WildIceGlalie121 from './wild_ice_glalie_1_21.js';
import WildIceLapras122 from './wild_ice_lapras_1_22.js';
import WildIceCloyster123 from './wild_ice_cloyster_1_23.js';
import WildIceSpheal224 from './wild_ice_spheal_2_24.js';
import WildIceSwinub225 from './wild_ice_swinub_2_25.js';
import WildIceSneasel226 from './wild_ice_sneasel_2_26.js';
import WildIceDelibird227 from './wild_ice_delibird_2_27.js';
import WildIceSmoochum228 from './wild_ice_smoochum_2_28.js';
import WildIceDewgong229 from './wild_ice_dewgong_2_29.js';
import WildIceSeel230 from './wild_ice_seel_2_30.js';
import WildIceJynx231 from './wild_ice_jynx_2_31.js';
import WildIcePiloswine232 from './wild_ice_piloswine_2_32.js';
import WildIceGlalie233 from './wild_ice_glalie_2_33.js';
import WildIceLapras234 from './wild_ice_lapras_2_34.js';
import WildIceCloyster235 from './wild_ice_cloyster_2_35.js';
import WildIceSpheal336 from './wild_ice_spheal_3_36.js';
import WildIceSwinub337 from './wild_ice_swinub_3_37.js';
import WildIceSneasel338 from './wild_ice_sneasel_3_38.js';
import WildIceDelibird339 from './wild_ice_delibird_3_39.js';
import WildIceSmoochum340 from './wild_ice_smoochum_3_40.js';
import WildIceDewgong341 from './wild_ice_dewgong_3_41.js';

export const WILD_POKEMON_PUZZLES = [
  WildPikachu,
  WildTreecko,
  WildCharmander,
  WildSlugma,
  WildSquirtle,
  WildLotad,
  WildMagnemite,
  WildSnorunt,
  WildEevee,
  WildPetalburgCaterpie0,
  WildPetalburgMetapod1,
  WildPetalburgWeedle2,
  WildPetalburgKakuna3,
  WildPetalburgBeedrill4,
  WildPetalburgOddish5,
  WildPetalburgParas6,
  WildPetalburgVenonat7,
  WildPetalburgBellsprout8,
  WildPetalburgScyther9,
  WildPetalburgPineco10,
  WildPetalburgSunkern11,
  WildPetalburgHoppip12,
  WildPetalburgYanma13,
  WildPetalburgWurmple14,
  WildPetalburgSilcoon15,
  WildPetalburgCascoon16,
  WildPetalburgSeedot17,
  WildPetalburgSurskit18,
  WildPetalburgShroomish19,
  WildPetalburgNincada20,
  WildPetalburgVolbeat21,
  WildPetalburgIllumise22,
  WildPetalburgRoselia23,
  WildPetalburgCaterpie124,
  WildPetalburgMetapod125,
  WildPetalburgWeedle126,
  WildPetalburgKakuna127,
  WildPetalburgBeedrill128,
  WildPetalburgOddish129,
  WildPetalburgParas130,
  WildPetalburgVenonat131,
  WildPetalburgBellsprout132,
  WildPetalburgScyther133,
  WildPetalburgPineco134,
  WildPetalburgSunkern135,
  WildPetalburgHoppip136,
  WildPetalburgYanma137,
  WildPetalburgWurmple138,
  WildPetalburgSilcoon139,
  WildPetalburgCascoon140,
  WildPetalburgSeedot141,
  WildVolcanoVulpix0,
  WildVolcanoGrowlithe1,
  WildVolcanoPonyta2,
  WildVolcanoMagmar3,
  WildVolcanoCharmeleon4,
  WildVolcanoHoundour5,
  WildVolcanoNumel6,
  WildVolcanoTorkoal7,
  WildVolcanoMagby8,
  WildVolcanoTorchic9,
  WildVolcanoCombusken10,
  WildVolcanoCamerupt11,
  WildVolcanoVulpix112,
  WildVolcanoGrowlithe113,
  WildVolcanoPonyta114,
  WildVolcanoMagmar115,
  WildVolcanoCharmeleon116,
  WildVolcanoHoundour117,
  WildVolcanoNumel118,
  WildVolcanoTorkoal119,
  WildVolcanoMagby120,
  WildVolcanoTorchic121,
  WildVolcanoCombusken122,
  WildVolcanoCamerupt123,
  WildVolcanoVulpix224,
  WildVolcanoGrowlithe225,
  WildVolcanoPonyta226,
  WildVolcanoMagmar227,
  WildVolcanoCharmeleon228,
  WildVolcanoHoundour229,
  WildVolcanoNumel230,
  WildVolcanoTorkoal231,
  WildVolcanoMagby232,
  WildVolcanoTorchic233,
  WildVolcanoCombusken234,
  WildVolcanoCamerupt235,
  WildVolcanoVulpix336,
  WildVolcanoGrowlithe337,
  WildVolcanoPonyta338,
  WildVolcanoMagmar339,
  WildVolcanoCharmeleon340,
  WildVolcanoHoundour341,
  WildClassicRattata0,
  WildClassicPidgey1,
  WildClassicMeowth2,
  WildClassicPsyduck3,
  WildClassicMachop4,
  WildClassicGeodude5,
  WildClassicAbra6,
  WildClassicMagikarp7,
  WildClassicEkans8,
  WildClassicSandshrew9,
  WildClassicJigglypuff10,
  WildClassicClefairy11,
  WildClassicDitto12,
  WildClassicSnorlax13,
  WildClassicBulbasaur14,
  WildClassicPidgeotto15,
  WildClassicSpearow16,
  WildClassicNidoran17,
  WildClassicRattata118,
  WildClassicPidgey119,
  WildClassicMeowth120,
  WildClassicPsyduck121,
  WildClassicMachop122,
  WildClassicGeodude123,
  WildClassicAbra124,
  WildClassicMagikarp125,
  WildClassicEkans126,
  WildClassicSandshrew127,
  WildClassicJigglypuff128,
  WildClassicClefairy129,
  WildClassicDitto130,
  WildClassicSnorlax131,
  WildClassicBulbasaur132,
  WildClassicPidgeotto133,
  WildClassicSpearow134,
  WildClassicNidoran135,
  WildClassicRattata236,
  WildClassicPidgey237,
  WildClassicMeowth238,
  WildClassicPsyduck239,
  WildClassicMachop240,
  WildClassicGeodude241,
  WildSootopolisPoliwag0,
  WildSootopolisTentacool1,
  WildSootopolisHorsea2,
  WildSootopolisGoldeen3,
  WildSootopolisStaryu4,
  WildSootopolisWooper5,
  WildSootopolisMarill6,
  WildSootopolisCorsola7,
  WildSootopolisChinchou8,
  WildSootopolisQwilfish9,
  WildSootopolisMudkip10,
  WildSootopolisWingull11,
  WildSootopolisCarvanha12,
  WildSootopolisWailmer13,
  WildSootopolisBarboach14,
  WildSootopolisClamperl15,
  WildSootopolisPoliwag116,
  WildSootopolisTentacool117,
  WildSootopolisHorsea118,
  WildSootopolisGoldeen119,
  WildSootopolisStaryu120,
  WildSootopolisWooper121,
  WildSootopolisMarill122,
  WildSootopolisCorsola123,
  WildSootopolisChinchou124,
  WildSootopolisQwilfish125,
  WildSootopolisMudkip126,
  WildSootopolisWingull127,
  WildSootopolisCarvanha128,
  WildSootopolisWailmer129,
  WildSootopolisBarboach130,
  WildSootopolisClamperl131,
  WildSootopolisPoliwag232,
  WildSootopolisTentacool233,
  WildSootopolisHorsea234,
  WildSootopolisGoldeen235,
  WildSootopolisStaryu236,
  WildSootopolisWooper237,
  WildSootopolisMarill238,
  WildSootopolisCorsola239,
  WildSootopolisChinchou240,
  WildSootopolisQwilfish241,
  WildMauvilleVoltorb0,
  WildMauvilleElectrike1,
  WildMauvillePlusle2,
  WildMauvilleMinun3,
  WildMauvillePichu4,
  WildMauvilleElekid5,
  WildMauvilleMagneton6,
  WildMauvilleSkarmory7,
  WildMauvilleAron8,
  WildMauvilleMareep9,
  WildMauvilleFlaaffy10,
  WildMauvilleVoltorb111,
  WildMauvilleElectrike112,
  WildMauvillePlusle113,
  WildMauvilleMinun114,
  WildMauvillePichu115,
  WildMauvilleElekid116,
  WildMauvilleMagneton117,
  WildMauvilleSkarmory118,
  WildMauvilleAron119,
  WildMauvilleMareep120,
  WildMauvilleFlaaffy121,
  WildMauvilleVoltorb222,
  WildMauvilleElectrike223,
  WildMauvillePlusle224,
  WildMauvilleMinun225,
  WildMauvillePichu226,
  WildMauvilleElekid227,
  WildMauvilleMagneton228,
  WildMauvilleSkarmory229,
  WildMauvilleAron230,
  WildMauvilleMareep231,
  WildMauvilleFlaaffy232,
  WildMauvilleVoltorb333,
  WildMauvilleElectrike334,
  WildMauvillePlusle335,
  WildMauvilleMinun336,
  WildMauvillePichu337,
  WildMauvilleElekid338,
  WildMauvilleMagneton339,
  WildMauvilleSkarmory340,
  WildMauvilleAron341,
  WildIceSpheal0,
  WildIceSwinub1,
  WildIceSneasel2,
  WildIceDelibird3,
  WildIceSmoochum4,
  WildIceDewgong5,
  WildIceSeel6,
  WildIceJynx7,
  WildIcePiloswine8,
  WildIceGlalie9,
  WildIceLapras10,
  WildIceCloyster11,
  WildIceSpheal112,
  WildIceSwinub113,
  WildIceSneasel114,
  WildIceDelibird115,
  WildIceSmoochum116,
  WildIceDewgong117,
  WildIceSeel118,
  WildIceJynx119,
  WildIcePiloswine120,
  WildIceGlalie121,
  WildIceLapras122,
  WildIceCloyster123,
  WildIceSpheal224,
  WildIceSwinub225,
  WildIceSneasel226,
  WildIceDelibird227,
  WildIceSmoochum228,
  WildIceDewgong229,
  WildIceSeel230,
  WildIceJynx231,
  WildIcePiloswine232,
  WildIceGlalie233,
  WildIceLapras234,
  WildIceCloyster235,
  WildIceSpheal336,
  WildIceSwinub337,
  WildIceSneasel338,
  WildIceDelibird339,
  WildIceSmoochum340,
  WildIceDewgong341,
];

/**
 * Weighted random pick of a wild puzzle within a region (rarer species have lower weight).
 * @param {string} region
 * @returns {object|null}
 */
export function pickWeightedWildPuzzle(region) {
  const candidates = WILD_POKEMON_PUZZLES.filter((p) => p.region === region);
  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, p) => sum + (p.weight || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const p of candidates) {
    roll -= p.weight || 1;
    if (roll <= 0) return p;
  }
  return candidates[candidates.length - 1];
}
