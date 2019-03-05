preview
---
* DOM
使用 angular element
`<preview-wrap preview="{}"></preview-wrap>`
`<img ng-click="showPreview(img,1)">`
* 只是一个展示容器，图片地址需要传递进去，preview.show 为true即出现

```JavaScript
$scope.showPreview = function(src, show) {
	$scope.preview.src = src;
	$scope.preview.show = show;
};
```




