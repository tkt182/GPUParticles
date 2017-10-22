#define PI 3.14159265358979

float random(vec2 n)
{
    return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

vec3 rotate(vec3 p, float angleDegree, vec3 axis)
{
	vec3      a = normalize(axis);
	float angle = angleDegree / 180. * PI;

	mat4 r = mat4(
		a.x*a.x+(1.-a.x*a.x)*cos(angle),        a.x*a.y*(1.-cos(angle))+a.z*sin(angle), a.x*a.z*(1.-cos(angle))-a.y*sin(angle), 0.,  // first column
		a.x*a.y*(1.-cos(angle))-a.z*sin(angle), a.y*a.y+(1.-a.y*a.y)*cos(angle),        a.y*a.z*(1.-cos(angle))+a.x*sin(angle), 0.,  // second column
		a.x*a.z*(1.-cos(angle))+a.y*sin(angle), a.y*a.z*(1.-cos(angle))-a.x*sin(angle), a.z*a.z+(1.-a.z*a.z)*cos(angle),        0.,  // third column
		0.,                                     0.,                                     0.,                                     1.   // forth column
	);

	vec4 pp = vec4(p, 1.);
	vec4 tmp = r * pp;

	return vec3(tmp.x, tmp.y, tmp.z);	
}