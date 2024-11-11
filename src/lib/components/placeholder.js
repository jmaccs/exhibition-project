import { writable } from 'svelte/store';
import { tick } from 'svelte';

export function createPlaceholder({ placeholders, element, speed, stay, preText }) {
  const { subscribe, set } = writable('');
  
  let charIdx = 0;
  let placeholderIdx = 0;
  let intervalId;

  async function setPlaceholder() {
    let placeholder = placeholders[placeholderIdx];
    let placeholderChunk = placeholder.substring(0, charIdx + 1);
    document.querySelector(element).setAttribute('placeholder', preText + ' ' + placeholderChunk);
    await tick();
  }

  async function onTickReverse(afterReverse) {
    if (charIdx === 0) {
      afterReverse();
      clearInterval(intervalId);
      init(); 
    } else {
      setPlaceholder();
      charIdx--;
      await tick();
    }
  }

  function goReverse() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      onTickReverse(() => {
        charIdx = 0;
        placeholderIdx = (placeholderIdx + 1) % placeholders.length;
      });
    }, speed);
  }

  async function onTick() {
    let placeholder = placeholders[placeholderIdx];
    if (charIdx === placeholder.length) {
      setTimeout(goReverse, stay);
    }
    setPlaceholder();
    charIdx++;
    await tick();
  }

  function init() {
    intervalId = setInterval(onTick, speed);
  }

  function kill() {
    clearInterval(intervalId);
  }

  init();

  return {
    subscribe,
    kill,
  };
}
