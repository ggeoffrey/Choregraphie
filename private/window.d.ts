interface Window {
    Database : any;
    startLoader(): void;
    stopLoader(): void;
    ChoregraphieControllers: any;
    toDateInputValue(date: Date): string;
    objectSize(object: any): number;

    lastRouteName: string;
    routeName: string;

    getTransitionDuration(): number;





    snapper: Snap;
    snapperExpanded: boolean;
    toggleEvents(): void;
    toggleConfig(): void;

    view3D: any;
    particlesSystem: any;




    

}

declare var window: Window;
