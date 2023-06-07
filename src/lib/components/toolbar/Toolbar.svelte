<script>
  import Button from './Button.svelte';
  import { toolState, circleState, labelState } from '$lib/utils/store.js';

  function selectTool (toolName) {
    if ($toolState.tool === toolName) {
      toolState.update(value => ({ 
        ...value, 
        tool: null
      }));
    } else {
      toolState.update(value => ({ 
        ...value, 
        tool: toolName
      }));    
    }
    console.log($toolState);
  }
</script>

<div class="toolbar">
    <Button buttonName='Label Tool' active={$toolState.tool === 'Label'} on:click={() => selectTool('Label')}/>
    <Button buttonName='Circle Tool' active={$toolState.tool === 'Circle'} on:click={() => selectTool('Circle')}/>


    {#if $toolState.tool === 'Circle'}
    <div class="options-dropdown">
        <div class="radius-input-container">
            <label for="radius-input">Radius</label>
            <input
                id="radius-input" 
                type="number" 
                bind:value={$circleState.radius} 
                placeholder="mi" 
            />
        </div>

        <div class="radius-input-container">    
            <label for="color-picker">Color</label>
            <input 
                id="color-picker" 
                type="color" 
                bind:value={$circleState.color} 
            />
        </div>
    </div>
    {/if}
    {#if $toolState.tool === 'Label'}
    <div class="options-dropdown">
    <div class="radius-input-container">
        <label for="label-color-picker">Label Color</label>
        <input
            id="label-color-picker" 
            type="color" 
            bind:value={$labelState.activeColor} 
            placeholder="Label" 
        />
    </div>
    <div class="checkbox-input-container">
        <label for="label-transparency-checkbox">Transparent</label>
        <input 
            id="label-transparency-checkbox" 
            type="checkbox" 
            bind:checked={$labelState.isTransparent}
        />
    </div>
</div>

    {/if}
</div>

<style>
    .toolbar {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: row;
        height: 52px;
        z-index: 5;
    }

    .options-dropdown {
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 2rem;
        right: 0;
        width: 75px;
        border: 1px solid rgb(224, 224, 224);
        background-color: white;
        padding: 10px;
        justify-content: center;
        margin-top: 1rem;
        border-radius: .5rem;
    }

    .radius-input-container {
        display: flex;
        flex-direction: column;
    }

    #radius-input {
        width: 50%;
    }

    #color-picker {
        width: 50%;
    }

</style>
