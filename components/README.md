# Components

> A component is a fundamental piece of the application. The whole application consists solely of components and 
> corresponding subcomponents.

### ActorsComponent

This component represents the column of the added actors, grouped by their respective bus group.

### BusGroupComponent

This component represents a bus group that the ActorsComponent consists of.

### ButtonComponent

A button wrapped around a component for customization.

### DropdownComponent

A customized select component.

### FileInputComponent

This component represents a button that handles files as input.

### IconButtonComponent

A button in the form of an icon.

### LogoComponent

Simply a component that represents the logo of Comunica in combination with the text `PACKAGER` under it.

### ObjectComponent

This component is the most complex one yet. It represents an "object". In this context it can either be an Actor or a 
Mediator that can be edited. This component makes the most use of the store to store the current state.