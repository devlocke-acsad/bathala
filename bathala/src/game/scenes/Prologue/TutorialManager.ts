import { Scene, GameObjects } from 'phaser';
import { Phase1_Welcome } from './phases/Phase1_Welcome';
import { Phase2_UnderstandingCards } from './phases/Phase2_UnderstandingCards';
import { Phase3_HandTypesAndBonuses } from './phases/Phase3_HandTypesAndBonuses';
import { Phase4_CombatActions } from './phases/Phase4_CombatActions';
import { Phase5_DiscardMechanic } from './phases/Phase5_DiscardMechanic';
import { Phase6_StatusEffects } from './phases/Phase6_StatusEffects';
import { Phase7_Items } from './phases/Phase7_Items';
import { Phase8_EnemyIntents } from './phases/Phase8_EnemyIntents';
import { Phase9_MoralChoice } from './phases/Phase9_MoralChoice';
import { Phase10_AdvancedConcepts } from './phases/Phase10_AdvancedConcepts';
import { Phase11_FinalTrial } from './phases/Phase11_FinalTrial';
import { createButton } from '../../ui/Button';
import { TutorialUI } from './ui/TutorialUI';

export class TutorialManager {
    private scene: Scene;
    private container: GameObjects.Container;
    private phases: any[];
    private currentPhaseIndex: number;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = this.scene.add.container(0, 0);
    }

    public start() {
        const bg = this.scene.add.image(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, 'chap1_no_leaves_boss');
        const scaleX = this.scene.cameras.main.width / bg.width;
        const scaleY = this.scene.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
        const overlay = this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x150E10).setAlpha(0.90);

        this.container.add([bg, overlay]);

        const skipButtonX = this.scene.cameras.main.width * 0.88;
        const skipButtonY = this.scene.cameras.main.height * 0.92;
        const skipButton = createButton(this.scene, skipButtonX, skipButtonY, 'Skip Tutorial', () => this.endTutorial(true));
        this.container.add(skipButton);

        const tutorialUI = new TutorialUI(this.scene);

        this.phases = [
            new Phase1_Welcome(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase2_UnderstandingCards(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase3_HandTypesAndBonuses(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase4_CombatActions(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase5_DiscardMechanic(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase6_StatusEffects(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase7_Items(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase8_EnemyIntents(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase9_MoralChoice(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase10_AdvancedConcepts(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase11_FinalTrial(this.scene, tutorialUI, this.startNextPhase.bind(this))
        ];
        this.currentPhaseIndex = 0;
        this.startNextPhase();
    }

    private startNextPhase() {
        if (this.currentPhaseIndex < this.phases.length) {
            const phase = this.phases[this.currentPhaseIndex++];
            phase.start();
        } else {
            this.endTutorial();
        }
    }

    private endTutorial(skipped = false) {
        if (skipped) {
            this.scene.scene.start('Overworld');
            return;
        }
        this.scene.tweens.add({ targets: this.container, alpha: 0, duration: 1000, ease: 'Power2', onComplete: () => { this.scene.scene.start('Overworld'); } });
    }
}
